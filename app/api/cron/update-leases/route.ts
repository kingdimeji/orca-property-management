import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  try {
    // Verify authorization header
    const authHeader = req.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const now = new Date()

    // Find all active leases that have expired
    const expiredLeases = await db.lease.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: now,
        },
      },
      include: {
        unit: true,
      },
    })

    // Update each expired lease and potentially mark unit as vacant
    let updatedCount = 0

    for (const lease of expiredLeases) {
      await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update lease status to EXPIRED
        await tx.lease.update({
          where: { id: lease.id },
          data: { status: "EXPIRED" },
        })

        // Check if there are any other active leases for this unit
        const otherActiveLeases = await tx.lease.count({
          where: {
            unitId: lease.unitId,
            status: "ACTIVE",
            id: { not: lease.id },
          },
        })

        // If no other active leases, mark unit as VACANT
        if (otherActiveLeases === 0) {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "VACANT" },
          })
        }
      })

      updatedCount++
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Successfully updated ${updatedCount} expired lease(s)`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
