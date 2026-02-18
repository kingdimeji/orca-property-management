"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { TimeRange } from "@/lib/reports"

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
  customStartDate?: Date
  customEndDate?: Date
  onCustomStartDateChange: (date: Date | undefined) => void
  onCustomEndDateChange: (date: Date | undefined) => void
}

export default function TimeRangeSelector({
  value,
  onChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: TimeRangeSelectorProps) {
  const formatDateForInput = (date?: Date) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onCustomStartDateChange(value ? new Date(value) : undefined)
  }

  const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onCustomEndDateChange(value ? new Date(value) : undefined)
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="timeRange">Time Range</Label>

      {/* Button Group */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange("month")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === "month"
              ? "bg-[#635bff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => onChange("quarter")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === "quarter"
              ? "bg-[#635bff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Quarter
        </button>
        <button
          onClick={() => onChange("year")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === "year"
              ? "bg-[#635bff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          This Year
        </button>
        <button
          onClick={() => onChange("all")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === "all"
              ? "bg-[#635bff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => onChange("custom")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === "custom"
              ? "bg-[#635bff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Custom
        </button>
      </div>

      {/* Custom Date Range Inputs */}
      {value === "custom" && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="customStartDate" className="text-xs">
              Start Date
            </Label>
            <Input
              id="customStartDate"
              type="date"
              value={formatDateForInput(customStartDate)}
              onChange={handleCustomStartChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customEndDate" className="text-xs">
              End Date
            </Label>
            <Input
              id="customEndDate"
              type="date"
              value={formatDateForInput(customEndDate)}
              onChange={handleCustomEndChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}
