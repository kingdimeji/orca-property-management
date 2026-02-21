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

    // Verify the property belongs to this user
    const property = await db.property.findUnique({
      where: { id },
    })

    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    if (property.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const units = await db.unit.findMany({
      where: { propertyId: id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(units)
  } catch (error) {
    console.error("Get property units error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
