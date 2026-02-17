"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tenant } from "@prisma/client"

export default function EditTenantForm({ tenant }: { tenant: Tenant }) {
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
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update tenant")
        return
      }

      router.push(`/tenants/${tenant.id}`)
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Tenant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="border-b-2 border-[#e3e8ef] pb-6">
            <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="firstName">
                  First Name <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={tenant.firstName}
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
                  defaultValue={tenant.lastName}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email">
                  Email <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={tenant.email}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone">
                  Phone <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={tenant.phone}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="border-b-2 border-[#e3e8ef] pb-6">
            <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Additional Contact</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="alternatePhone">Alternate Phone</label>
                <Input
                  id="alternatePhone"
                  name="alternatePhone"
                  type="tel"
                  defaultValue={tenant.alternatePhone || ""}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="emergencyContact">Emergency Contact Name</label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  defaultValue={tenant.emergencyContact || ""}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="emergencyPhone">Emergency Contact Phone</label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                defaultValue={tenant.emergencyPhone || ""}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="border-b-2 border-[#e3e8ef] pb-6">
            <h3 className="text-lg font-semibold text-[#0a2540] mb-4">Identification</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="idType">ID Type</label>
                <select
                  id="idType"
                  name="idType"
                  defaultValue={tenant.idType || ""}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635bff]"
                >
                  <option value="">Select ID type...</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="idNumber">ID Number</label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  defaultValue={tenant.idNumber || ""}
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Link href={`/tenants/${tenant.id}`}>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
