"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import type { TenantWithLeases } from "@/types/prisma"

interface DeleteTenantButtonProps {
  tenant: TenantWithLeases
}

export default function DeleteTenantButton({ tenant }: DeleteTenantButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const response = await fetch(`/api/tenants/${tenant.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete tenant")
    }

    router.push("/tenants")
  }

  const activeLeases = tenant.leases.filter((lease) => lease.status === "ACTIVE")
  const hasActiveLeases = activeLeases.length > 0
  const warningText = hasActiveLeases
    ? `This tenant has ${activeLeases.length} active lease(s). You must terminate all active leases before deleting this tenant.`
    : tenant.leases.length > 0
    ? "This will permanently delete all lease history for this tenant."
    : undefined

  return (
    <ConfirmDialog
      title="Delete Tenant?"
      message="This action cannot be undone. The tenant record will be permanently removed from the system."
      warningText={warningText}
      confirmLabel="Delete Tenant"
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
