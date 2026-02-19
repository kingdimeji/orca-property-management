import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { randomBytes, createHash } from "crypto"

export const runtime = "nodejs"

/**
 * POST /api/tenants/[id]/invite
 * Send portal invite to tenant
 */
export async function POST(
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
    const tenantId = id

    // Verify tenant exists and belongs to this landlord
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leases: {
          include: {
            unit: true,
          },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 }
      )
    }

    // Verify landlord owns this tenant
    if (tenant.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized - Not your tenant" },
        { status: 403 }
      )
    }

    // Check if tenant already has auth account
    if (tenant.authUserId) {
      return NextResponse.json(
        { message: "Tenant already has portal access" },
        { status: 400 }
      )
    }

    // Generate secure random token (32 bytes = 256 bits)
    const rawToken = randomBytes(32).toString("hex")

    // Hash token before storing (SHA-256)
    const hashedToken = createHash("sha256").update(rawToken).digest("hex")

    // Set expiry to 48 hours from now
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 48)

    // Update tenant with invite token
    await db.tenant.update({
      where: { id: tenantId },
      data: {
        inviteToken: hashedToken,
        inviteTokenExpiry: expiryDate,
      },
    })

    // Generate invite link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const inviteLink = `${baseUrl}/tenant/accept-invite?token=${rawToken}`

    // TODO: Send email with invite link
    // For MVP, we'll return the link directly
    // In production, use an email service (SendGrid, Resend, etc.)

    return NextResponse.json({
      message: "Invite sent successfully",
      inviteLink, // Remove this in production
      expiresAt: expiryDate.toISOString(),
      tenant: {
        email: tenant.email,
        name: `${tenant.firstName} ${tenant.lastName}`,
      },
    })
  } catch (error) {
    console.error("Error sending tenant invite:", error)
    return NextResponse.json(
      { message: "Failed to send invite" },
      { status: 500 }
    )
  }
}
