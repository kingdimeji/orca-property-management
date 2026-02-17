"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import type { PropertyWithUnits } from "@/types/prisma"

interface DeletePropertyButtonProps {
  property: PropertyWithUnits
}

export default function DeletePropertyButton({
  property,
}: DeletePropertyButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const response = await fetch(`/api/properties/${property.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete property")
    }

    router.push("/properties")
  }

  const hasUnits = property.units.length > 0
  const warningText = hasUnits
    ? `This property has ${property.units.length} unit(s). All units, leases, and payment records will be permanently deleted.`
    : undefined

  return (
    <ConfirmDialog
      title="Delete Property?"
      message="This action cannot be undone. All associated data will be permanently removed from the system."
      warningText={warningText}
      confirmLabel="Delete Property"
      onConfirm={handleDelete}
    >
      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </ConfirmDialog>
  )
}
