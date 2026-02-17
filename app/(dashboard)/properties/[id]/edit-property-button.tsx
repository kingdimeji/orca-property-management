"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Edit } from "lucide-react"
import type { PropertyWithUnits } from "@/types/prisma"

export default function EditPropertyButton({ property }: { property: PropertyWithUnits }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
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
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update property")
        return
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#e3e8ef]">
        <div className="flex items-center justify-between p-6 border-b-2 border-[#e3e8ef]">
          <h2 className="text-2xl font-bold text-[#0a2540]">Edit Property</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#718096] hover:text-[#0a2540] transition-colors rounded-lg p-2 hover:bg-[#f7fafc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name">
              Property Name <span className="text-[#df1b41]">*</span>
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={property.name}
              placeholder="e.g., Sunset Apartments"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address">
              Street Address <span className="text-[#df1b41]">*</span>
            </label>
            <Input
              id="address"
              name="address"
              defaultValue={property.address}
              placeholder="e.g., 123 Main Street"
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
                defaultValue={property.city}
                placeholder="e.g., Lagos"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state">State/Province</label>
              <Input
                id="state"
                name="state"
                defaultValue={property.state || ""}
                placeholder="e.g., Lagos State"
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
                defaultValue={property.country}
                placeholder="e.g., Nigeria"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="postalCode">Postal Code</label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={property.postalCode || ""}
                placeholder="e.g., 100001"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="propertyType">
              Property Type <span className="text-[#df1b41]">*</span>
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={property.propertyType}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635bff]"
            >
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="CONDO">Condo</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={property.description || ""}
              placeholder="Additional details about the property..."
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635bff]"
            />
          </div>

          {error && (
            <div className="bg-[#fef2f2] border-2 border-[#df1b41] text-[#df1b41] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t-2 border-[#e3e8ef]">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
