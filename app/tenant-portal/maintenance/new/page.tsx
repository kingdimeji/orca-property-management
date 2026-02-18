"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import Link from "next/link"

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", description: "Can wait, not urgent" },
  { value: "MEDIUM", label: "Medium", description: "Should be addressed soon" },
  { value: "HIGH", label: "High", description: "Needs attention quickly" },
  { value: "URGENT", label: "Urgent", description: "Emergency, immediate attention" },
]

const CATEGORY_OPTIONS = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliances",
  "Doors/Windows",
  "Flooring",
  "Walls/Ceiling",
  "Pest Control",
  "Security",
  "Other",
]

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      category: formData.get("category") as string,
    }

    try {
      const response = await fetch("/api/tenant-portal/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit request")
      }

      router.push("/tenant-portal/maintenance")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tenant-portal/maintenance"
          className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Maintenance
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Submit Maintenance Request
        </h1>
        <p className="text-gray-600 mt-1">
          Report an issue or request repairs for your unit
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Kitchen sink is leaking"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Brief summary of the issue
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe the issue in detail. Include when it started, what you've observed, and any relevant information..."
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Provide as much detail as possible to help resolve the issue quickly
              </p>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRIORITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="relative flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      required
                      disabled={isSubmitting}
                      className="mt-0.5"
                      defaultChecked={option.value === "MEDIUM"}
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={isSubmitting}
              >
                <option value="">Select a category (optional)</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Help categorize your request
              </p>
            </div>

            {/* Image Upload - Placeholder for future implementation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Photos (Coming Soon)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Photo upload feature will be available soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  For now, you can describe the issue in detail above
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link href="/tenant-portal/maintenance">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> For urgent issues like no heat, gas leaks, or
            major water leaks, mark as URGENT and contact your landlord directly by
            phone for faster response.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
