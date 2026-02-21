"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import type { Property, Unit } from "@prisma/client"
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

type AllocationRow = {
  unitId: string
  unitName: string
  percentage: number
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
  const [selectedPropertyId, setSelectedPropertyId] = useState(expense.propertyId || "")
  const [isShared, setIsShared] = useState(expense.isShared)
  const [allocations, setAllocations] = useState<AllocationRow[]>(() =>
    (expense.allocations ?? []).map((a) => ({
      unitId: a.unitId,
      unitName: a.unit.name,
      percentage: a.percentage,
    }))
  )
  const [amount, setAmount] = useState(String(expense.amount))
  const router = useRouter()

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

  // When isShared is toggled on with a property, load units
  useEffect(() => {
    if (isShared && selectedPropertyId) {
      // If existing allocations match the selected property, keep them
      if (allocations.length > 0) return

      fetch(`/api/properties/${selectedPropertyId}/units`)
        .then((res) => res.json())
        .then((units: Unit[]) => {
          if (units.length === 0) return
          const equalPct = parseFloat((100 / units.length).toFixed(2))
          setAllocations(
            units.map((u, i) => ({
              unitId: u.id,
              unitName: (u as any).name,
              percentage:
                i === units.length - 1
                  ? parseFloat((100 - equalPct * (units.length - 1)).toFixed(2))
                  : equalPct,
            }))
          )
        })
        .catch((err) => console.error("Failed to load units:", err))
    } else if (!isShared) {
      setAllocations([])
    }
  }, [isShared, selectedPropertyId])

  function handlePropertyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedPropertyId(e.target.value)
    setIsShared(false)
    setAllocations([])
  }

  function handlePercentageChange(unitId: string, value: string) {
    const pct = parseFloat(value) || 0
    setAllocations((prev) =>
      prev.map((a) => (a.unitId === unitId ? { ...a, percentage: pct } : a))
    )
  }

  const totalPct = allocations.reduce((sum, a) => sum + a.percentage, 0)
  const allocationValid = Math.abs(totalPct - 100) <= 0.5

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isShared && allocations.length > 0 && !allocationValid) {
      setError("Allocation percentages must total 100%")
      return
    }

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(formData.get("amount") as string),
          category: formData.get("category"),
          description: formData.get("description"),
          date: formData.get("date"),
          propertyId: formData.get("propertyId") || null,
          maintenanceRequestId: formData.get("maintenanceRequestId") || null,
          vendor: formData.get("vendor") || null,
          receiptUrl: formData.get("receiptUrl") || null,
          notes: formData.get("notes") || null,
          isShared,
          allocations: isShared
            ? allocations.map((a) => ({ unitId: a.unitId, percentage: a.percentage }))
            : [],
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

  const formattedDate = new Date(expense.date).toISOString().split("T")[0]
  const parsedAmount = parseFloat(amount) || 0

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
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">
                    Are you sure you want to delete this expense?
                  </p>
                  <p className="text-red-700 text-sm">
                    This action cannot be undone. The expense record will be permanently removed.
                    {expense.isShared && " Unit allocations will also be deleted."}
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
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
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
                      value={selectedPropertyId}
                      onChange={handlePropertyChange}
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

                {/* Split across units checkbox */}
                {selectedPropertyId && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <input
                      type="checkbox"
                      id="isShared"
                      checked={isShared}
                      onChange={(e) => setIsShared(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isShared" className="text-sm text-blue-800 cursor-pointer mb-0">
                      Split this expense across all units in this property
                    </Label>
                  </div>
                )}

                {/* Allocation table */}
                {isShared && allocations.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Unit Allocation
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {allocations.map((a) => (
                        <div key={a.unitId} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="flex-1 text-sm text-gray-700">{a.unitName}</span>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={a.percentage}
                              onChange={(e) => handlePercentageChange(a.unitId, e.target.value)}
                              className="w-20 h-8 text-sm text-right"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-28 text-right">
                            {parsedAmount > 0
                              ? formatCurrency((parsedAmount * a.percentage) / 100, currency)
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
                      <span className="text-xs font-semibold text-gray-600">Total</span>
                      <span
                        className={`text-xs font-semibold ${
                          allocationValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {totalPct.toFixed(2)}% {!allocationValid && "(must equal 100%)"}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 w-28 text-right">
                        {parsedAmount > 0 ? formatCurrency(parsedAmount, currency) : "—"}
                      </span>
                    </div>
                  </div>
                )}

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
                      disabled={isLoading || (isShared && allocations.length > 0 && !allocationValid)}
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
