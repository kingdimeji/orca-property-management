import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendMaintenanceRequestEmail } from "@/lib/email"

/**
 * GET /api/tenant-portal/maintenance
 * Get tenant's maintenance requests
 */
export async function GET(req: Request) {
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

    // Get maintenance requests
    const requests = await db.maintenanceRequest.findMany({
      where: { reportedBy: tenant.id },
      include: {
        unit: true,
      },
      orderBy: { reportedDate: "desc" },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching maintenance requests:", error)
    return NextResponse.json(
      { message: "Failed to fetch maintenance requests" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tenant-portal/maintenance
 * Submit new maintenance request
 */
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { message: "Unauthorized - Tenants only" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, priority, category } = body

    // Validation
    if (!title || !description || !priority) {
      return NextResponse.json(
        { message: "Title, description, and priority are required" },
        { status: 400 }
      )
    }

    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      return NextResponse.json(
        { message: "Invalid priority level" },
        { status: 400 }
      )
    }

    // Get tenant profile
    const tenant = await db.tenant.findUnique({
      where: { authUserId: session.user.id },
      include: {
        leases: {
          where: { status: "ACTIVE" },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant profile not found" },
        { status: 404 }
      )
    }

    if (!tenant.leases || tenant.leases.length === 0) {
      return NextResponse.json(
        { message: "No active lease found" },
        { status: 400 }
      )
    }

    const activeLease = tenant.leases[0]

    // Create maintenance request with full relations for email
    const request = await db.maintenanceRequest.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category || null,
        status: "OPEN",
        images: [],
        unitId: activeLease.unitId,
        reportedBy: tenant.id,
      },
      include: {
        unit: {
          include: {
            property: {
              include: {
                user: true, // Landlord
              },
            },
          },
        },
        tenant: true,
      },
    })

    // Send email notification to landlord
    try {
      const landlord = request.unit.property.user
      await sendMaintenanceRequestEmail(
        landlord.email,
        landlord.name || "Landlord",
        `${request.tenant!.firstName} ${request.tenant!.lastName}`,
        request.unit.property.name,
        request.unit.name,
        request.title,
        request.description,
        request.priority,
        request.id
      )
      console.log(`Maintenance request email sent to ${landlord.email}`)
    } catch (emailError) {
      console.error("Failed to send maintenance request email:", emailError)
      // Don't throw - request is still created even if email fails
    }

    return NextResponse.json(
      {
        message: "Maintenance request submitted successfully",
        request,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating maintenance request:", error)
    return NextResponse.json(
      { message: "Failed to submit maintenance request" },
      { status: 500 }
    )
  }
}
