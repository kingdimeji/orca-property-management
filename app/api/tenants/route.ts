import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
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

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { message: "First name, last name, email, and phone are required" },
        { status: 400 }
      )
    }

    // Check if tenant with this email already exists
    const existingTenant = await db.tenant.findUnique({
      where: { email },
    })

    if (existingTenant) {
      return NextResponse.json(
        { message: "A tenant with this email already exists" },
        { status: 400 }
      )
    }

    const tenant = await db.tenant.create({
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
        userId: session.user.id,
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error("Create tenant error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const tenants = await db.tenant.findMany({
      include: {
        leases: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error("Get tenants error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
