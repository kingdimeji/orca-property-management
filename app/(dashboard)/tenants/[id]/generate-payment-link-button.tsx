"use client"

import { useState } from "react"
import { Link as LinkIcon, X, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GeneratePaymentLinkButtonProps {
  leaseId: string
  monthlyRent: number
  currency: string
  tenantEmail: string
}

export default function GeneratePaymentLinkButton({
  leaseId,
  monthlyRent,
  currency,
  tenantEmail,
}: GeneratePaymentLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const amount = formData.get("amount") as string
    const dueDate = formData.get("dueDate") as string
    const notes = formData.get("notes") as string

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaseId,
          amount: parseFloat(amount),
          dueDate,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate payment link")
      }

      // Show success modal with payment link
      setPaymentLink(data.paymentLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard() {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function closeModal() {
    setIsOpen(false)
    setPaymentLink(null)
    setError("")
    setCopied(false)
  }

  // If showing success modal with payment link
  if (paymentLink) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Generate Payment Link
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Link Generated
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Share this link with your tenant
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Payment Link */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Link
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={paymentLink}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Next Steps:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share this link with your tenant via WhatsApp, Email, or SMS</li>
                    <li>• The tenant clicks the link to view payment details</li>
                    <li>• They complete payment securely through Paystack</li>
                    <li>• You'll be notified when payment is received</li>
                  </ul>
                </div>

                {/* Preview Button */}
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview Payment Page
                  </Button>
                </a>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
                <Button type="button" onClick={closeModal}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Default: Show form modal
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        <LinkIcon className="w-4 h-4 mr-2" />
        Generate Payment Link
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Generate Payment Link
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create a secure payment link for your tenant
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount ({currency})
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={monthlyRent}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pre-filled with monthly rent. You can adjust if needed.
                  </p>
                </div>

                {/* Due Date */}
                <div>
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                    className="mt-1"
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any additional information for the tenant..."
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tenant:</strong> {tenantEmail}
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    A payment link will be generated that you can share with your tenant.
                    They'll be able to pay securely through Paystack.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
