import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createHash } from "crypto"

export const runtime = "nodejs"

/**
 * GET /api/tenant-invite/validate?token=...
 * Validate invite token and return tenant info
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawToken = searchParams.get("token")

    if (!rawToken) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      )
    }

    // Hash the token to compare with stored hash
    const hashedToken = createHash("sha256").update(rawToken).digest("hex")

    // Find tenant with matching token
    const tenant = await db.tenant.findFirst({
      where: {
        inviteToken: hashedToken,
      },
      include: {
        leases: {
          include: {
            unit: {
        include: {
          property: true,
        },
      },
          },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { message: "Invalid invite token" },
        { status: 404 }
      )
    }

    // Check if token has expired
    if (!tenant.inviteTokenExpiry || tenant.inviteTokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Invite link has expired" },
        { status: 410 }
      )
    }

    // Check if tenant already has auth account
    if (tenant.authUserId) {
      return NextResponse.json(
        { message: "Tenant already has portal access" },
        { status: 400 }
      )
    }

    // Get property and unit info from most recent lease
    const currentLease = tenant.leases[0]

    return NextResponse.json({
      tenant: {
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        propertyName: currentLease?.unit?.property?.name,
        unitName: currentLease?.unit?.name,
      },
    })
  } catch (error) {
    console.error("Error validating invite token:", error)
    return NextResponse.json(
      { message: "Failed to validate invite" },
      { status: 500 }
    )
  }
}
