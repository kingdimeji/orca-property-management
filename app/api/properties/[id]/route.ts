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

    const property = await db.property.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        units: true,
      },
    })

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Get property error:", error)
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

    // Verify ownership
    const existing = await db.property.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { name, address, city, state, country, postalCode, propertyType, description } = body

    // Validate required fields
    if (!name || !address || !city || !country) {
      return NextResponse.json(
        { message: "Name, address, city, and country are required" },
        { status: 400 }
      )
    }

    const updated = await db.property.update({
      where: { id },
      data: {
        name,
        address,
        city,
        state: state || null,
        country,
        postalCode: postalCode || null,
        propertyType: propertyType || "APARTMENT",
        description: description || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update property error:", error)
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

    // Verify ownership
    const existing = await db.property.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 }
      )
    }

    // Delete property (cascade deletes units, leases, and payments via Prisma schema)
    await db.property.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Delete property error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
