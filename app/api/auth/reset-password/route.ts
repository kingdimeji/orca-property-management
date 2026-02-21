import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { createHash } from "crypto"

export const runtime = "nodejs"

/**
 * POST /api/auth/reset-password
 * Reset password using valid token
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

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Additional password strength checks
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        {
          message:
            "Password must contain uppercase, lowercase, and numbers",
        },
        { status: 400 }
      )
    }

    // Hash token
    const hashedToken = createHash("sha256").update(token).digest("hex")

    // Find user with valid token
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

    // Hash new password (use 12 rounds like tenant invite)
    const hashedPassword = await hash(password, 12)

    // Update password and clear reset token (atomic operation)
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      message: "Password reset successfully. You can now log in.",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { message: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
