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

    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: {
            unit: {
        include: {
          property: true,
        },
      },
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 })
    }

    // Verify user owns at least one property related to this tenant's leases
    const hasAccess = tenant.leases.some(
      (lease) => lease.unit.property.userId === session.user.id
    )

    if (!hasAccess && tenant.leases.length > 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Get tenant error:", error)
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

    // Verify ownership through lease relationship
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: {
            unit: {
        include: {
          property: true,
        },
      },
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 })
    }

    // Verify user owns at least one property related to this tenant's leases
    const hasAccess = tenant.leases.some(
      (lease) => lease.unit.property.userId === session.user.id
    )

    if (!hasAccess && tenant.leases.length > 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      alternatePhone,
      emergencyContact,
      emergencyPhone,
      idType,
      idNumber,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: "First name, last name, email, and phone are required" },
        { status: 400 }
      )
    }

    // Check if email is being changed and if it conflicts with another tenant
    if (email !== tenant.email) {
      const existingTenant = await db.tenant.findUnique({
        where: { email },
      })

      if (existingTenant) {
        return NextResponse.json(
          { message: "A tenant with this email already exists" },
          { status: 400 }
        )
      }
    }

    const updated = await db.tenant.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        alternatePhone: alternatePhone || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        idType: idType || null,
        idNumber: idNumber || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update tenant error:", error)
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

    // Verify ownership through lease relationship
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: {
            unit: {
        include: {
          property: true,
        },
      },
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 })
    }

    // Verify user owns at least one property related to this tenant's leases
    const hasAccess = tenant.leases.some(
      (lease) => lease.unit.property.userId === session.user.id
    )

    if (!hasAccess && tenant.leases.length > 0) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Check for active leases - prevent deletion if any exist
    const activeLeases = tenant.leases.filter((lease) => lease.status === "ACTIVE")

    if (activeLeases.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete tenant with ${activeLeases.length} active lease(s). Please terminate all leases first.`,
        },
        { status: 400 }
      )
    }

    // Delete tenant (cascade deletes leases via Prisma schema)
    await db.tenant.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Tenant deleted successfully" })
  } catch (error) {
    console.error("Delete tenant error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
