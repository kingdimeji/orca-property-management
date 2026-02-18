import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  Home,
  FileText,
  DollarSign,
  Wrench,
  LogOut,
} from "lucide-react"
import { signOut } from "@/lib/auth"

interface NavigationItem {
  name: string
  href: string
  icon: any
}

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

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/tenant-portal", icon: Home },
    { name: "My Lease", href: "/tenant-portal/lease", icon: FileText },
    { name: "Payments", href: "/tenant-portal/payments", icon: DollarSign },
    { name: "Maintenance", href: "/tenant-portal/maintenance", icon: Wrench },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-teal-600">Orca</h1>
            <span className="ml-2 text-xs font-semibold text-gray-500 uppercase">
              Tenant
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.name || "Tenant"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button
                type="submit"
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
