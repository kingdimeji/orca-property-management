"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  DollarSign,
  Wrench,
  LogOut,
  Menu,
  X
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface TenantPortalSidebarProps {
  userName: string
  userEmail: string
  signOutAction: () => Promise<void>
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/tenant-portal", icon: Home },
  { name: "My Lease", href: "/tenant-portal/lease", icon: FileText },
  { name: "Payments", href: "/tenant-portal/payments", icon: DollarSign },
  { name: "Maintenance", href: "/tenant-portal/maintenance", icon: Wrench },
]

export function TenantPortalSidebar({ userName, userEmail, signOutAction }: TenantPortalSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300",
        "lg:translate-x-0", // Always visible on desktop
        sidebarOpen ? "translate-x-0" : "-translate-x-full" // Slide in/out on mobile
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-600">Legde</h1>
              <span className="ml-2 text-xs font-semibold text-gray-500 uppercase">
                Tenant
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  )}
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
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            <form
              action={async () => {
                await signOutAction()
              }}
            >
              <button
                type="submit"
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile header with hamburger */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-bold text-teal-600">Legde</h1>
        <span className="ml-2 text-xs font-semibold text-gray-500 uppercase">
          Tenant
        </span>
      </div>
    </>
  )
}
