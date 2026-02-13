"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
      postalCode: formData.get("postalCode") as string,
      propertyType: formData.get("propertyType") as string,
      description: formData.get("description") as string,
    }

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create property")
        return
      }

      const property = await response.json()
      router.push(`/properties/${property.id}`)
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/properties"
        className="inline-flex items-center text-sm text-[#718096] hover:text-[#0a2540] mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0a2540]">Add New Property</h1>
        <p className="mt-2 text-[#718096]">
          Fill in the details below to add a new property
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name">
                Property Name <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Sunset Apartments"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="propertyType">
                Property Type <span className="text-[#df1b41]">*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                disabled={isLoading}
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="CONDO">Condo</option>
                <option value="DUPLEX">Duplex</option>
                <option value="STUDIO">Studio</option>
                <option value="TOWNHOUSE">Townhouse</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="address">
                Street Address <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main Street"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city">
                  City <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Lagos"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state">
                  State/Province
                </label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Lagos State"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="country">
                  Country <span className="text-[#df1b41]">*</span>
                </label>
                <Input
                  id="country"
                  name="country"
                  placeholder="Nigeria"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="postalCode">
                  Postal Code
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  placeholder="100001"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Additional details about the property..."
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-[#fef2f2] border-2 border-[#df1b41] text-[#df1b41] px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Property"}
              </Button>
              <Link href="/properties">
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
