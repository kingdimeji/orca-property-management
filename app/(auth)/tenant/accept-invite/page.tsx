"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic'
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

interface TenantInfo {
  firstName: string
  lastName: string
  email: string
  propertyName?: string
  unitName?: string
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isValidating, setIsValidating] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError("Invalid invite link - no token provided")
      setIsValidating(false)
      return
    }

    async function validateToken() {
      try {
        const response = await fetch(
          `/api/tenant-invite/validate?token=${token}`
        )
        const data = await response.json()

        if (!response.ok) {
          setValidationError(data.message || "Invalid or expired invite link")
        } else {
          setTenantInfo(data.tenant)
        }
      } catch (error) {
        setValidationError("Failed to validate invite link")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError("")

    // Validate passwords
    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      // Accept invite (create user account)
      const response = await fetch("/api/tenant-invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.message || "Failed to create account")
        setIsSubmitting(false)
        return
      }

      // Auto-login
      const signInResult = await signIn("credentials", {
        email: tenantInfo!.email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setSubmitError("Account created but login failed. Please login manually.")
        setIsSubmitting(false)
        return
      }

      // Redirect to tenant portal
      router.push("/tenant-portal")
      router.refresh()
    } catch (error) {
      setSubmitError("Something went wrong. Please try again.")
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
              Validating invite link...
            </h3>
            <p className="text-gray-600">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (validationError || !tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12 text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Invite Link
            </h3>
            <p className="text-gray-600 mb-6">
              {validationError || "This invite link is invalid or has expired."}
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-[#635bff] hover:bg-[#5348e8]"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success - show form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl">Welcome to Orca</CardTitle>
          </div>
          <CardDescription>
            Create your tenant portal password to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tenant Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span>{" "}
                {tenantInfo.firstName} {tenantInfo.lastName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {tenantInfo.email}
              </p>
              {tenantInfo.propertyName && (
                <p className="text-gray-700">
                  <span className="font-medium">Property:</span>{" "}
                  {tenantInfo.propertyName}
                  {tenantInfo.unitName && ` - ${tenantInfo.unitName}`}
                </p>
              )}
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
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

            <Button
              type="submit"
              className="w-full bg-[#635bff] hover:bg-[#5348e8]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account & Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            By creating an account, you agree to access your tenant portal and
            manage your lease information.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
