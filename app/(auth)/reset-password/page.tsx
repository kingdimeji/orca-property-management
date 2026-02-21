"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isValidating, setIsValidating] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError("Invalid reset link - no token provided")
      setIsValidating(false)
      return
    }

    async function validateToken() {
      try {
        const response = await fetch(
          `/api/auth/reset-password/validate?token=${token}`
        )
        const data = await response.json()

        if (!response.ok) {
          setValidationError(data.message || "Invalid or expired reset link")
        } else {
          setUserEmail(data.email)
        }
      } catch (error) {
        setValidationError("Failed to validate reset link")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError("")

    // Validate password
    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match")
      return
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setSubmitError(
        "Password must contain uppercase, lowercase, and numbers"
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.message || "Failed to reset password")
        setIsSubmitting(false)
        return
      }

      setResetSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=success")
      }, 3000)
    } catch (error) {
      setSubmitError("Network error. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-16 h-16 text-[#635bff] mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Validating reset link...
            </h3>
            <p className="text-gray-600">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12 text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Reset Link
            </h3>
            <p className="text-gray-600 mb-6">{validationError}</p>
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Password Reset Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Reset Password</CardTitle>
          <CardDescription>Create a new password for {userEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must contain uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>

            {submitError && (
              <div className="bg-[#fef2f2] border-2 border-[#df1b41] text-[#df1b41] px-4 py-3 rounded-lg text-sm font-medium">
                {submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#635bff] hover:text-[#0a2540] font-semibold transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrapper with Suspense (required for useSearchParams in Next.js 15)
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-16 h-16 text-[#635bff] mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading...
              </h3>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
