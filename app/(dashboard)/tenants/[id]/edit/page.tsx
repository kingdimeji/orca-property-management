import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import EditTenantForm from "./edit-tenant-form"

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const tenant = await db.tenant.findUnique({
    where: { id },
    include: {
      leases: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  })

  if (!tenant) {
    notFound()
  }

  // Verify user owns at least one property related to this tenant's leases
  const hasAccess = tenant.leases.some(
    (lease) => lease.unit.property.userId === session.user.id
  )

  if (!hasAccess && tenant.leases.length > 0) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Tenant</h1>
      <EditTenantForm tenant={tenant} />
    </div>
  )
}
