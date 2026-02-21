import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: maintenanceRequestId } = await params

    // Verify maintenance request exists and user has access to it
    // (either landlord who owns the property, or tenant who reported it)
    const maintenanceRequest = await db.maintenanceRequest.findFirst({
      where: {
        id: maintenanceRequestId,
        OR: [
          // Landlord owns the property
          {
            unit: {
              property: {
                userId: session.user.id,
              },
            },
          },
          // Tenant reported the request
          {
            tenant: {
              authUserId: session.user.id,
            },
          },
        ],
      },
      include: {
        tenant: true,
      },
    })

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      )
    }

    // Get all expenses linked to this maintenance request
    const expenses = await db.expense.findMany({
      where: {
        maintenanceRequestId,
      },
      include: {
        property: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching maintenance expenses:", error)
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}
