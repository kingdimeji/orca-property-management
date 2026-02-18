"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Receipt, DollarSign, Printer } from "lucide-react"
import type { Payment, Expense, Property } from "@prisma/client"
import {
  exportExpensesToCSV,
  exportIncomesToCSV,
  exportFinancialReportToCSV,
} from "@/lib/csv-export"

interface ExportMenuProps {
  payments: (Payment & {
    lease: {
      tenant: any
      unit: {
        property: Property
      }
    }
  })[]
  expenses: (Expense & { property: Property | null })[]
  dateRange: { startDate: Date; endDate: Date }
  currency: string
}

export default function ExportMenu({
  payments,
  expenses,
  dateRange,
  currency,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExportExpenses = () => {
    exportExpensesToCSV(expenses, currency)
    setIsOpen(false)
  }

  const handleExportIncome = () => {
    exportIncomesToCSV(payments, currency)
    setIsOpen(false)
  }

  const handleExportFullReport = () => {
    exportFinancialReportToCSV(payments, expenses, dateRange, currency)
    setIsOpen(false)
  }

  const handlePrint = () => {
    window.print()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#635bff] hover:bg-[#5348e8] text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-2">
              <button
                onClick={handleExportExpenses}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Receipt className="w-4 h-4 mr-3 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">Export Expenses</div>
                  <div className="text-xs text-gray-500">
                    CSV file with all expenses
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportIncome}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Export Income</div>
                  <div className="text-xs text-gray-500">
                    CSV file with all payments
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportFullReport}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Export Full Report</div>
                  <div className="text-xs text-gray-500">
                    Complete financial summary (CSV)
                  </div>
                </div>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={handlePrint}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Printer className="w-4 h-4 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Print / Save as PDF</div>
                  <div className="text-xs text-gray-500">
                    Open print dialog
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
