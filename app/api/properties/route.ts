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
    const { name, address, city, state, country, postalCode, propertyType, description } = body

    if (!name || !address || !city || !country) {
      return NextResponse.json(
        { message: "Name, address, city, and country are required" },
        { status: 400 }
      )
    }

    const property = await db.property.create({
      data: {
        name,
        address,
        city,
        state: state || null,
        country,
        postalCode: postalCode || null,
        propertyType: propertyType || "APARTMENT",
        description: description || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error("Create property error:", error)
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

    const properties = await db.property.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        units: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Get properties error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
