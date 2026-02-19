import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { tenantId, unitId, startDate, endDate, monthlyRent, deposit, terms } = body

    if (!tenantId || !unitId || !startDate || !endDate || !monthlyRent || deposit === undefined) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Verify unit belongs to user and is vacant
    const unit = await db.unit.findUnique({
      where: {
        id: unitId,
      },
      include: {
        property: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ message: "Unit not found" }, { status: 404 })
    }

    if (unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    if (unit.status !== "VACANT") {
      return NextResponse.json(
        { message: "Unit is not vacant" },
        { status: 400 }
      )
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 })
    }

    // Create lease and update unit status in a transaction
    const lease = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the lease
      const newLease = await tx.lease.create({
        data: {
          tenantId,
          unitId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          monthlyRent: parseFloat(monthlyRent),
          deposit: parseFloat(deposit),
          terms: terms || null,
          status: "ACTIVE",
        },
        include: {
          unit: {
        include: {
          property: true,
        },
      },
          tenant: true,
        },
      })

      // Update unit status to OCCUPIED
      await tx.unit.update({
        where: { id: unitId },
        data: { status: "OCCUPIED" },
      })

      return newLease
    })

    return NextResponse.json(lease, { status: 201 })
  } catch (error) {
    console.error("Create lease error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
