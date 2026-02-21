import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MaintenanceStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const propertyId = searchParams.get("propertyId")

    // Build where clause
    const where: any = {
      unit: {
        property: {
          userId: session.user.id,
        },
      },
    }

    // Filter by status if provided (can be comma-separated for multiple)
    if (status) {
      const statuses = status.split(",") as MaintenanceStatus[]
      where.status = { in: statuses }
    }

    // Filter by property if provided
    if (propertyId) {
      where.unit = {
        ...where.unit,
        propertyId,
      }
    }

    const maintenanceRequests = await db.maintenanceRequest.findMany({
      where,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
      orderBy: {
        reportedDate: "desc",
      },
    })

    return NextResponse.json(maintenanceRequests)
  } catch (error) {
    console.error("Error fetching maintenance requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    )
  }
}
