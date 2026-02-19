import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ReportsDashboard from "./reports-dashboard"

export default async function ReportsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all data in parallel for client-side filtering
  const [payments, expenses, properties] = await Promise.all([
    // Fetch all payments with full relations for property access
    db.payment.findMany({
      include: {
        lease: {
          include: {
            tenant: true,
            unit: true,
          },
        },
      },
      orderBy: { dueDate: "desc" },
    }),

    // Fetch all expenses with property relation
    db.expense.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        property: true,
      },
      orderBy: { date: "desc" },
    }),

    // Fetch all properties for filtering
    db.property.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { name: "asc" },
    }),
  ])

  // Filter payments to only user's properties
  const userPayments = payments.filter(
    (payment) => payment.lease.unit.property.userId === session.user.id
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive income, expenses, and profit/loss analysis
        </p>
      </div>

      <ReportsDashboard
        payments={userPayments}
        expenses={expenses}
        properties={properties}
        currency={session.user.currency}
      />
    </div>
  )
}
