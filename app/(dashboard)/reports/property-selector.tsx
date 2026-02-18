"use client"

import { Label } from "@/components/ui/label"
import type { Property } from "@prisma/client"

interface PropertySelectorProps {
  properties: Property[]
  value: string
  onChange: (value: string) => void
}

export default function PropertySelector({
  properties,
  value,
  onChange,
}: PropertySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="propertyFilter">Property</Label>
      <select
        id="propertyFilter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="all">All Properties</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Filter reports by specific property
      </p>
    </div>
  )
}
