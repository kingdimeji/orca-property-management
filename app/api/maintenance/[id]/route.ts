import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendMaintenanceStatusUpdateEmail } from "@/lib/email"

/**
 * PATCH /api/maintenance/[id]
 * Update maintenance request (landlord only)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { message: "Unauthorized - Landlords only" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { status, notes, cost } = body

    // Get existing request with all relations
    const existingRequest = await db.maintenanceRequest.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: {
              include: {
                user: true,
              },
            },
          },
        },
        tenant: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Maintenance request not found" },
        { status: 404 }
      )
    }

    // Verify landlord owns this property
    if (existingRequest.unit.property.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your property" },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (status !== undefined) {
      if (!["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          { message: "Invalid status" },
          { status: 400 }
        )
      }
      updateData.status = status

      // Set resolved date if completed
      if (status === "COMPLETED" && !existingRequest.resolvedDate) {
        updateData.resolvedDate = new Date()
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes.trim()
    }

    if (cost !== undefined) {
      updateData.cost = parseFloat(cost)
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
        tenant: true,
      },
    })

    // Send status update email to tenant if status changed
    if (status && status !== existingRequest.status && updatedRequest.tenant) {
      try {
        await sendMaintenanceStatusUpdateEmail(
          updatedRequest.tenant.email,
          `${updatedRequest.tenant.firstName} ${updatedRequest.tenant.lastName}`,
          updatedRequest.unit.property.name,
          updatedRequest.unit.name,
          updatedRequest.title,
          existingRequest.status,
          updatedRequest.status,
          updatedRequest.notes,
          updatedRequest.id
        )
        console.log(
          `Maintenance status update email sent to ${updatedRequest.tenant.email}`
        )
      } catch (emailError) {
        console.error(
          "Failed to send maintenance status update email:",
          emailError
        )
        // Don't throw - update is still saved even if email fails
      }
    }

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
