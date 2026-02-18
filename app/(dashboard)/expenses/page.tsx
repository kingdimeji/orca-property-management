import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, TrendingDown, Tag, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { ExpenseWithProperty } from "@/types/prisma"
import AddExpenseButton from "./add-expense-button"
import EditExpenseButton from "./edit-expense-button"

// Format category names for display
function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}

export default async function ExpensesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all expenses for the user
  const expenses: ExpenseWithProperty[] = await db.expense.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      property: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  // Calculate summary metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const thisMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear()
    )
  })

  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Find top category
  const categoryTotals: Record<string, number> = {}
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  const topCategoryEntry = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  )[0]
  const topCategory = topCategoryEntry
    ? formatCategory(topCategoryEntry[0])
    : "None"

  // Recent expenses count (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentCount = expenses.filter((e) => new Date(e.date) >= thirtyDaysAgo).length

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-2 text-gray-600">
            Track all expenses across your properties
          </p>
        </div>
        <AddExpenseButton currency={session.user.currency} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(thisMonthTotal, session.user.currency)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {thisMonthExpenses.length} expense(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Category
            </CardTitle>
            <Tag className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{topCategory}</div>
            <p className="text-xs text-gray-500 mt-1">
              {topCategoryEntry
                ? formatCurrency(topCategoryEntry[1], session.user.currency)
                : "No expenses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Expenses
            </CardTitle>
            <Receipt className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recentCount}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No expenses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start tracking expenses to get insights into your property costs.
              </p>
              <AddExpenseButton currency={session.user.currency} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Property
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Vendor
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {formatCategory(expense.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900">{expense.description}</div>
                        {expense.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {expense.property ? (
                          expense.property.name
                        ) : (
                          <span className="text-gray-400 italic">
                            General
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {expense.vendor || (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-red-600">
                        {formatCurrency(expense.amount, session.user.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <EditExpenseButton
                          expense={expense}
                          currency={session.user.currency}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
