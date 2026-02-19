import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const lease = await db.lease.findUnique({
      where: { id },
      include: {
        unit: true,
        tenant: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    // Verify ownership through unit → property relationship
    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(lease)
  } catch (error) {
    console.error("Get lease error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through unit → property relationship
    const lease = await db.lease.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { startDate, endDate, monthlyRent, deposit, status, terms } = body

    // Validate required fields
    if (!startDate || !endDate || !monthlyRent || deposit === undefined) {
      return NextResponse.json(
        { message: "Start date, end date, monthly rent, and deposit are required" },
        { status: 400 }
      )
    }

    // Check if status is being changed from ACTIVE to EXPIRED/TERMINATED
    const statusChanging =
      lease.status === "ACTIVE" && (status === "EXPIRED" || status === "TERMINATED")

    if (statusChanging) {
      // Use transaction to update lease status and unit status
      const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update lease
        const updatedLease = await tx.lease.update({
          where: { id },
          data: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            monthlyRent: parseFloat(monthlyRent),
            deposit: parseFloat(deposit),
            status,
            terms: terms || null,
          },
          include: {
            unit: true,
            tenant: true,
          },
        })

        // Check if unit has other ACTIVE leases
        const otherActiveLeases = await tx.lease.count({
          where: {
            unitId: lease.unitId,
            status: "ACTIVE",
            id: { not: id },
          },
        })

        // Only mark unit as VACANT if no other active leases
        if (otherActiveLeases === 0) {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "VACANT" },
          })
        }

        return updatedLease
      })

      return NextResponse.json(updated)
    } else {
      // Simple update without transaction
      const updated = await db.lease.update({
        where: { id },
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          monthlyRent: parseFloat(monthlyRent),
          deposit: parseFloat(deposit),
          status,
          terms: terms || null,
        },
        include: {
          unit: true,
          tenant: true,
        },
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error("Update lease error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through unit → property relationship
    const lease = await db.lease.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    })

    if (!lease) {
      return NextResponse.json({ message: "Lease not found" }, { status: 404 })
    }

    if (lease.unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Use transaction to delete lease and potentially update unit status
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete lease (cascade deletes payments via Prisma schema)
      await tx.lease.delete({
        where: { id },
      })

      // If this was an ACTIVE lease, check if unit should be marked VACANT
      if (lease.status === "ACTIVE") {
        const otherActiveLeases = await tx.lease.count({
          where: {
            unitId: lease.unitId,
            status: "ACTIVE",
          },
        })

        // Only mark unit as VACANT if no other active leases
        if (otherActiveLeases === 0) {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: "VACANT" },
          })
        }
      }
    })

    return NextResponse.json({ message: "Lease deleted successfully" })
  } catch (error) {
    console.error("Delete lease error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
