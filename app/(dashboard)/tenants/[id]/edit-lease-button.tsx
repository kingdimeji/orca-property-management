"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Edit, AlertTriangle } from "lucide-react"

type Lease = {
  id: string
  startDate: Date
  endDate: Date
  monthlyRent: number
  deposit: number
  status: string
  terms: string | null
  unit: {
    id: string
    name: string
    property: {
      id: string
      name: string
    }
  }
}

export default function EditLeaseButton({ lease }: { lease: Lease }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState(lease.status)

  const showStatusWarning =
    lease.status === "ACTIVE" && (selectedStatus === "EXPIRED" || selectedStatus === "TERMINATED")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      monthlyRent: parseFloat(formData.get("monthlyRent") as string),
      deposit: parseFloat(formData.get("deposit") as string),
      status: formData.get("status") as string,
      terms: formData.get("terms") as string,
    }

    try {
      const response = await fetch(`/api/leases/${lease.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update lease")
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
      <Button onClick={() => setIsOpen(true)} size="sm" variant="outline">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    )
  }

  // Format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    return d.toISOString().split("T")[0]
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#e3e8ef]">
        <div className="flex items-center justify-between p-6 border-b-2 border-[#e3e8ef]">
          <h2 className="text-2xl font-bold text-[#0a2540]">Edit Lease Agreement</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#718096] hover:text-[#0a2540] transition-colors rounded-lg p-2 hover:bg-[#f7fafc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Property & Unit</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
              {lease.unit.property.name} - {lease.unit.name}
            </div>
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
                defaultValue={formatDateForInput(lease.startDate)}
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
                defaultValue={formatDateForInput(lease.endDate)}
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
                defaultValue={lease.monthlyRent}
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
                defaultValue={lease.deposit}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status">
              Status <span className="text-[#df1b41]">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#635bff]"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {showStatusWarning && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Status Change Warning</p>
                <p>Changing this lease to {selectedStatus} will mark the unit as VACANT (if no other active leases exist).</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="terms">Lease Terms & Conditions</label>
            <textarea
              id="terms"
              name="terms"
              rows={4}
              defaultValue={lease.terms || ""}
              placeholder="Additional lease terms, rules, and conditions..."
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
