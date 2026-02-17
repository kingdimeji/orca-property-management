"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import type { Lease, Unit } from "@prisma/client"

interface LeaseWithUnit extends Lease {
  unit: Unit
}

interface DeleteLeaseButtonProps {
  lease: LeaseWithUnit
}

export default function DeleteLeaseButton({ lease }: DeleteLeaseButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const response = await fetch(`/api/leases/${lease.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete lease")
    }

    router.refresh()
  }

  const isActiveLease = lease.status === "ACTIVE"
  const warningText = isActiveLease
    ? "Deleting this active lease will mark the unit as VACANT. All payment records for this lease will also be permanently deleted."
    : "All payment records for this lease will be permanently deleted."

  return (
    <ConfirmDialog
      title="Delete Lease?"
      message="This action cannot be undone. The lease and all associated payment history will be permanently removed."
      warningText={warningText}
      confirmLabel="Delete Lease"
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
