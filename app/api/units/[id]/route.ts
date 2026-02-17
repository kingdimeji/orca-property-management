import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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

    const unit = await db.unit.findUnique({
      where: { id },
      include: {
        property: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ message: "Unit not found" }, { status: 404 })
    }

    // Verify ownership through property relationship
    if (unit.property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error("Get unit error:", error)
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

    // Verify ownership through property relationship
    const unit = await db.unit.findUnique({
      where: { id },
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

    const body = await req.json()
    const { name, bedrooms, bathrooms, monthlyRent, deposit, description } = body

    // Validate required fields
    if (!name || bedrooms === undefined || bathrooms === undefined || !monthlyRent) {
      return NextResponse.json(
        { message: "Name, bedrooms, bathrooms, and monthly rent are required" },
        { status: 400 }
      )
    }

    const updated = await db.unit.update({
      where: { id },
      data: {
        name,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        monthlyRent: parseFloat(monthlyRent),
        deposit: deposit ? parseFloat(deposit) : 0,
        description: description || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update unit error:", error)
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

    // Verify ownership through property relationship
    const unit = await db.unit.findUnique({
      where: { id },
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

    // Check for active leases - prevent deletion if any exist
    const activeLeases = await db.lease.count({
      where: {
        unitId: id,
        status: "ACTIVE",
      },
    })

    if (activeLeases > 0) {
      return NextResponse.json(
        { message: "Cannot delete unit with active leases. Please terminate the lease first." },
        { status: 400 }
      )
    }

    // Delete unit (cascade deletes leases and payments via Prisma schema)
    await db.unit.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Unit deleted successfully" })
  } catch (error) {
    console.error("Delete unit error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
