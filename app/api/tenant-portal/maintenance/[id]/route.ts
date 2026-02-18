import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/tenant-portal/maintenance/[id]
 * Get specific maintenance request
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { message: "Unauthorized - Tenants only" },
        { status: 401 }
      )
    }

    // Get tenant profile
    const tenant = await db.tenant.findUnique({
      where: { authUserId: session.user.id },
    })

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant profile not found" },
        { status: 404 }
      )
    }

    const { id } = await params

    // Get maintenance request
    const request = await db.maintenanceRequest.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
    })

    if (!request) {
      return NextResponse.json(
        { message: "Maintenance request not found" },
        { status: 404 }
      )
    }

    // Verify this request belongs to the tenant
    if (request.reportedBy !== tenant.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your request" },
        { status: 403 }
      )
    }

    return NextResponse.json({ request })
  } catch (error) {
    console.error("Error fetching maintenance request:", error)
    return NextResponse.json(
      { message: "Failed to fetch maintenance request" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tenant-portal/maintenance/[id]
 * Update maintenance request (tenant can add notes/images)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { message: "Unauthorized - Tenants only" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { description } = body

    // Get tenant profile
    const tenant = await db.tenant.findUnique({
      where: { authUserId: session.user.id },
    })

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant profile not found" },
        { status: 404 }
      )
    }

    const { id } = await params

    // Get existing request
    const existingRequest = await db.maintenanceRequest.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Maintenance request not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existingRequest.reportedBy !== tenant.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your request" },
        { status: 403 }
      )
    }

    // Only allow updating description (tenants can add more details)
    const updateData: any = {}
    if (description !== undefined) {
      updateData.description = description.trim()
    }

    // Update request
    const updatedRequest = await db.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Maintenance request updated successfully",
      request: updatedRequest,
    })
  } catch (error) {
    console.error("Error updating maintenance request:", error)
    return NextResponse.json(
      { message: "Failed to update maintenance request" },
      { status: 500 }
    )
  }
}
