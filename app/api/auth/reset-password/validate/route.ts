import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createHash } from "crypto"

export const runtime = "nodejs"

/**
 * GET /api/auth/reset-password/validate?token=...
 * Validate password reset token
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawToken = searchParams.get("token")

    if (!rawToken) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    // Hash token to compare with stored hash
    const hashedToken = createHash("sha256").update(rawToken).digest("hex")

    // Find user with matching token
    const user = await db.user.findFirst({
      where: { resetToken: hashedToken },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 404 }
      )
    }

    // Check expiry
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Reset link has expired. Please request a new one." },
        { status: 410 }
      )
    }

    // Return minimal user info (email only for display)
    return NextResponse.json({
      email: user.email,
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { message: "Failed to validate reset link" },
      { status: 500 }
    )
  }
}
