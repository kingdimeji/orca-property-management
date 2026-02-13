"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTenantPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      alternatePhone: formData.get("alternatePhone") as string,
      emergencyContact: formData.get("emergencyContact") as string,
      emergencyPhone: formData.get("emergencyPhone") as string,
      idType: formData.get("idType") as string,
      idNumber: formData.get("idNumber") as string,
    }

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create tenant")
        return
      }

      const tenant = await response.json()
      router.push(`/tenants/${tenant.id}`)
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/tenants"
        className="inline-flex items-center text-sm text-[#718096] hover:text-[#0a2540] mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tenants
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0a2540]">Add New Tenant</h1>
        <p className="mt-2 text-[#718096]">
          Fill in the tenant&apos;s details below
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName">
                  First Name <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName">
                  Last Name <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email">
                Email <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone">
                  Phone <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="alternatePhone">
                  Alternate Phone
                </label>
                <Input
                  id="alternatePhone"
                  name="alternatePhone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t-2 border-[#e3e8ef] pt-6">
              <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="emergencyContact">
                    Name
                  </label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    placeholder="Jane Doe"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="emergencyPhone">
                    Phone
                  </label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#e3e8ef] pt-6">
              <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="idType">
                    ID Type
                  </label>
                  <select
                    id="idType"
                    name="idType"
                    disabled={isLoading}
                  >
                    <option value="">Select ID type...</option>
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                    <option value="Voter's Card">Voter&apos;s Card</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="idNumber">
                    ID Number
                  </label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    placeholder="ABC12345678"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-[#fef2f2] border-2 border-[#df1b41] text-[#df1b41] px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Tenant"}
              </Button>
              <Link href="/tenants">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
