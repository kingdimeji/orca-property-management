import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomBytes, createHash } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export const runtime = "nodejs"

/**
 * POST /api/auth/forgot-password
 * Request password reset link via email
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Validate email format
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      )
    }

    // Find user (timing-safe - don't reveal existence)
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // ALWAYS return success to prevent user enumeration
    // If user doesn't exist, still return success after same processing time

    if (user) {
      // Generate secure random token (32 bytes = 64 hex chars)
      const rawToken = randomBytes(32).toString("hex")

      // Hash token before storing (SHA-256)
      const hashedToken = createHash("sha256").update(rawToken).digest("hex")

      // Set 1-hour expiry
      const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Update user with reset token (invalidates any previous tokens)
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: expiryDate,
        },
      })

      // Generate reset link
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      const resetLink = `${baseUrl}/reset-password?token=${rawToken}`

      // Send email with raw token
      await sendPasswordResetEmail(
        user.email,
        user.name || "User",
        resetLink,
        expiryDate
      )
    } else {
      // Simulate processing time to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Always return generic success message
    return NextResponse.json({
      message:
        "If an account exists with that email, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { message: "Failed to process request. Please try again." },
      { status: 500 }
    )
  }
}
