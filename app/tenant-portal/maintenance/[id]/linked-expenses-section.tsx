"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface LinkedExpense {
  id: string
  amount: number
  category: string
  description: string
  date: Date
  vendor: string | null
}

interface LinkedExpensesSectionProps {
  maintenanceRequestId: string
  currency: string
}

export function LinkedExpensesSection({
  maintenanceRequestId,
  currency
}: LinkedExpensesSectionProps) {
  const [expenses, setExpenses] = useState<LinkedExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/maintenance/${maintenanceRequestId}/expenses`)
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setExpenses(data)
        } else {
          console.error("Invalid response format:", data)
          setExpenses([])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error)
        setExpenses([])
        setLoading(false)
      })
  }, [maintenanceRequestId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Linked Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading expenses...</p>
        </CardContent>
      </Card>
    )
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Linked Expenses
          </CardTitle>
          {expenses.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(totalExpenses, currency)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No expenses linked to this maintenance request yet.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={expense.category.toLowerCase()}>
                      {formatCategory(expense.category)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {expense.description}
                  </p>
                  {expense.vendor && (
                    <p className="text-xs text-gray-500 mt-1">
                      Vendor: {expense.vendor}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-red-600">
                    {formatCurrency(expense.amount, currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
