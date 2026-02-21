"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Property } from "@prisma/client"
import type { ExpenseWithRelations } from "@/types/prisma"

interface EditExpenseButtonProps {
  expense: ExpenseWithRelations
  currency: string
}

type MaintenanceRequestWithUnit = {
  id: string
  title: string
  status: string
  unit: {
    id: string
    name: string
    property: {
      id: string
      name: string
    }
  }
}

const EXPENSE_CATEGORIES = [
  "MAINTENANCE",
  "REPAIRS",
  "UTILITIES",
  "INSURANCE",
  "TAXES",
  "MANAGEMENT_FEES",
  "CLEANING",
  "LANDSCAPING",
  "LEGAL",
  "ADVERTISING",
  "OTHER",
]

// Format category for display
function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default function EditExpenseButton({
  expense,
  currency,
}: EditExpenseButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [error, setError] = useState("")
  const [properties, setProperties] = useState<Property[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequestWithUnit[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  // Fetch properties and maintenance requests when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsDataLoading(true)
      Promise.all([
        fetch("/api/properties").then((res) => res.json()),
        fetch("/api/maintenance?status=OPEN,IN_PROGRESS").then((res) => res.json()),
      ])
        .then(([propertiesData, maintenanceData]) => {
          setProperties(propertiesData)
          setMaintenanceRequests(maintenanceData)
          setIsDataLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load data:", err)
          setIsDataLoading(false)
        })
    }
  }, [isOpen])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const amount = formData.get("amount") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const propertyId = formData.get("propertyId") as string
    const maintenanceRequestId = formData.get("maintenanceRequestId") as string
    const vendor = formData.get("vendor") as string
    const receiptUrl = formData.get("receiptUrl") as string
    const notes = formData.get("notes") as string

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          date,
          propertyId: propertyId || null,
          maintenanceRequestId: maintenanceRequestId || null,
          vendor: vendor || null,
          receiptUrl: receiptUrl || null,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update expense")
      }

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense")
    } finally {
      setIsLoading(false)
    }
  }

  async function onDelete() {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete expense")
      }

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense")
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format date for input (YYYY-MM-DD)
  const formattedDate = new Date(expense.date).toISOString().split("T")[0]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 mr-3"
        title="Edit expense"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative bg-white rounded-xl max-w-2xl w-full mx-4 shadow-2xl border-2 border-[#e3e8ef] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#e3e8ef]">
              <h2 className="text-2xl font-bold text-[#0a2540]">Edit Expense</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {showDeleteConfirm ? (
              /* Delete Confirmation */
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">
                    Are you sure you want to delete this expense?
                  </p>
                  <p className="text-red-700 text-sm">
                    This action cannot be undone. The expense record will be permanently
                    removed.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onDelete}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? "Deleting..." : "Delete Expense"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={onSubmit} className="p-6 space-y-5">
                {/* Amount and Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount ({currency}) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={expense.amount}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={formattedDate}
                      required
                    />
                  </div>
                </div>

                {/* Category and Property Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={expense.category}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select category</option>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategory(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyId">Property (Optional)</Label>
                    <select
                      id="propertyId"
                      name="propertyId"
                      defaultValue={expense.propertyId || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">General / Company</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Maintenance Request */}
                <div className="space-y-2">
                  <Label htmlFor="maintenanceRequestId">Maintenance Request (Optional)</Label>
                  <select
                    id="maintenanceRequestId"
                    name="maintenanceRequestId"
                    defaultValue={expense.maintenanceRequestId || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">None - General Expense</option>
                    {maintenanceRequests.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.title} ({request.unit.property.name} - {request.unit.name})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Link this expense to a specific maintenance request for better tracking
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    defaultValue={expense.description}
                    required
                    placeholder="e.g., Plumbing repair for Unit 2A"
                  />
                </div>

                {/* Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor / Supplier</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    type="text"
                    defaultValue={expense.vendor || ""}
                    placeholder="e.g., ABC Plumbing Services"
                  />
                </div>

                {/* Receipt URL */}
                <div className="space-y-2">
                  <Label htmlFor="receiptUrl">Receipt / Invoice URL</Label>
                  <Input
                    id="receiptUrl"
                    name="receiptUrl"
                    type="url"
                    defaultValue={expense.receiptUrl || ""}
                    placeholder="https://..."
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={expense.notes || ""}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Additional notes about this expense..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#635bff] hover:bg-[#5348e8] text-white"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
