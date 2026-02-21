import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { TenantPortalSidebar } from "@/components/tenant-portal-sidebar"

export default async function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Redirect landlords trying to access tenant portal
  if (session.user.role !== "TENANT") {
    redirect("/dashboard")
  }

  const signOutAction = async () => {
    "use server"
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TenantPortalSidebar
        userName={session.user.name || "Tenant"}
        userEmail={session.user.email || ""}
        signOutAction={signOutAction}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
