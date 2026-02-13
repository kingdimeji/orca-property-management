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
    const { propertyId, name, bedrooms, bathrooms, monthlyRent, deposit, description } = body

    if (!propertyId || !name || bedrooms === undefined || bathrooms === undefined || !monthlyRent) {
      return NextResponse.json(
        { message: "Property ID, name, bedrooms, bathrooms, and monthly rent are required" },
        { status: 400 }
      )
    }

    // Verify property belongs to user
    const property = await db.property.findUnique({
      where: {
        id: propertyId,
        userId: session.user.id,
      },
    })

    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    const unit = await db.unit.create({
      data: {
        name,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        monthlyRent: parseFloat(monthlyRent),
        deposit: deposit ? parseFloat(deposit) : 0,
        description: description || null,
        propertyId,
        status: "VACANT",
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error("Create unit error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
