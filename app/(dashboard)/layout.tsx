import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Prevent tenants from accessing landlord dashboard
  if (session.user.role === "TENANT") {
    redirect("/tenant-portal")
  }

  const signOutAction = async () => {
    "use server"
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        userName={session.user.name || "User"}
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
