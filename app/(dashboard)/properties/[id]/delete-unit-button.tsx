"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import type { Unit } from "@prisma/client"

interface DeleteUnitButtonProps {
  unit: Unit
}

export default function DeleteUnitButton({ unit }: DeleteUnitButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const response = await fetch(`/api/units/${unit.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete unit")
    }

    router.refresh()
  }

  const isOccupied = unit.status === "OCCUPIED"
  const warningText = isOccupied
    ? "This unit has an active lease. You must terminate the lease before deleting the unit."
    : undefined

  return (
    <ConfirmDialog
      title="Delete Unit?"
      message="This action cannot be undone. All lease history and payment records for this unit will be permanently deleted."
      warningText={warningText}
      confirmLabel="Delete Unit"
      onConfirm={handleDelete}
    >
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </ConfirmDialog>
  )
}
