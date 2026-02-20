"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RecordPaymentButtonProps {
  leaseId: string
  monthlyRent: number
  currency: string
}

export default function RecordPaymentButton({
  leaseId,
  monthlyRent,
  currency,
}: RecordPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const amount = formData.get("amount") as string
    const dueDate = formData.get("dueDate") as string
    const paidDate = formData.get("paidDate") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const paymentType = formData.get("paymentType") as string
    const reference = formData.get("reference") as string
    const lateFee = formData.get("lateFee") as string
    const status = formData.get("status") as string
    const notes = formData.get("notes") as string

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaseId,
          amount: parseFloat(amount),
          dueDate,
          paidDate: paidDate || null,
          paymentMethod: paymentMethod || null,
          paymentType: paymentType || "RENT",
          reference: reference || null,
          lateFee: lateFee ? parseFloat(lateFee) : 0,
          status,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record payment")
      }

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setIsLoading(false)
    }
  }

  // Format today's date as YYYY-MM-DD for date input default
  const today = new Date().toISOString().split("T")[0]

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="bg-[#0a2540] hover:bg-[#1a3550] text-white"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Record Payment
      </Button>

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
              <h2 className="text-2xl font-bold text-[#0a2540]">
                Record Payment
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-6 space-y-5">
              {/* Amount and Due Date Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={monthlyRent}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                  />
                </div>
              </div>

              {/* Paid Date and Late Fee Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paidDate">Paid Date</Label>
                  <Input
                    id="paidDate"
                    name="paidDate"
                    type="date"
                    defaultValue={today}
                  />
                  <p className="text-xs text-[#718096]">
                    Leave empty if payment is pending
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Fee</Label>
                  <Input
                    id="lateFee"
                    name="lateFee"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Payment Method and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-2"
                  >
                    <option value="">Select method...</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Paystack">Paystack</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue="PAID"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-2"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Payment Type Row */}
              <div className="space-y-2">
                <Label htmlFor="paymentType">
                  Payment Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="paymentType"
                  name="paymentType"
                  required
                  defaultValue="RENT"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-2"
                >
                  <option value="RENT">Rent</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="WATER">Water</option>
                  <option value="GAS">Gas</option>
                  <option value="INTERNET">Internet</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SECURITY_DEPOSIT">Security Deposit</option>
                  <option value="LATE_FEE">Late Fee</option>
                  <option value="OTHER">Other</option>
                </select>
                <p className="text-xs text-[#718096]">
                  What this payment is for
                </p>
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label htmlFor="reference">Reference / Transaction ID</Label>
                <Input
                  id="reference"
                  name="reference"
                  type="text"
                  placeholder="e.g., TXN123456789"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Add any additional notes about this payment..."
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#635bff] focus:ring-offset-2 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[#fef2f2] border-2 border-[#df1b41] rounded text-sm text-[#df1b41]">
                  {error}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-[#e3e8ef]">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#0a2540] hover:bg-[#1a3550] text-white"
                >
                  {isLoading ? "Recording..." : "Record Payment"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
