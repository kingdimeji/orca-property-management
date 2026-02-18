import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash as hashPassword, createHash } from "crypto"
import { hash } from "bcryptjs"

export const runtime = "nodejs"

/**
 * POST /api/tenant-invite/accept
 * Accept invite and create tenant user account
 */
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Hash the token to find tenant
    const hashedToken = createHash("sha256").update(token).digest("hex")

    // Find tenant with matching token
    const tenant = await db.tenant.findFirst({
      where: {
        inviteToken: hashedToken,
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

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create User account with TENANT role
    const newUser = await db.user.create({
      data: {
        email: tenant.email,
        name: `${tenant.firstName} ${tenant.lastName}`,
        password: hashedPassword,
        role: "TENANT",
        country: "NG", // Default, can be updated later
        currency: "NGN", // Default, can be updated later
      },
    })

    // Link tenant to auth user and clear invite token
    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        authUserId: newUser.id,
        inviteToken: null,
        inviteTokenExpiry: null,
      },
    })

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error: any) {
    console.error("Error accepting invite:", error)

    // Handle unique constraint violation (email already exists)
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    )
  }
}
