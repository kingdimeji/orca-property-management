"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

type Unit = {
  id: string
  name: string
  monthlyRent: number
  deposit: number
  property: {
    id: string
    name: string
  }
}

export default function CreateLeaseButton({
  tenantId,
  units,
}: {
  tenantId: string
  units: Unit[]
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState("")

  const selectedUnit = units.find((u) => u.id === selectedUnitId)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      tenantId,
      unitId: selectedUnitId,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      monthlyRent: parseFloat(formData.get("monthlyRent") as string),
      deposit: parseFloat(formData.get("deposit") as string),
      terms: formData.get("terms") as string,
    }

    try {
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create lease")
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
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Lease
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#e3e8ef]">
        <div className="flex items-center justify-between p-6 border-b-2 border-[#e3e8ef]">
          <h2 className="text-2xl font-bold text-[#0a2540]">Create Lease Agreement</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#718096] hover:text-[#0a2540] transition-colors rounded-lg p-2 hover:bg-[#f7fafc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="unitId">
              Select Unit <span className="text-[#df1b41]">*</span>
            </label>
            <select
              id="unitId"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Choose a unit...</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.property.name} - {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate">
                Start Date <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate">
                End Date <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="monthlyRent">
                Monthly Rent <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                min="0"
                step="0.01"
                defaultValue={selectedUnit?.monthlyRent || ""}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deposit">
                Security Deposit <span className="text-[#df1b41]">*</span>
              </label>
              <Input
                id="deposit"
                name="deposit"
                type="number"
                min="0"
                step="0.01"
                defaultValue={selectedUnit?.deposit || ""}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="terms">
              Lease Terms & Conditions
            </label>
            <textarea
              id="terms"
              name="terms"
              rows={4}
              placeholder="Additional lease terms, rules, and conditions..."
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-[#fef2f2] border-2 border-[#df1b41] text-[#df1b41] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t-2 border-[#e3e8ef]">
            <Button type="submit" disabled={isLoading || !selectedUnitId} className="flex-1">
              {isLoading ? "Creating..." : "Create Lease"}
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
