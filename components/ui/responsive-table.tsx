"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  headers: string[]
  rows: {
    cells: ReactNode[]
    key: string
  }[]
  mobileCardRender?: (row: { cells: ReactNode[]; key: string }) => ReactNode
  className?: string
}

export function ResponsiveTable({
  headers,
  rows,
  mobileCardRender,
  className
}: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn("w-full", className)}>
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-gray-50">
                {row.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-4 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {rows.map((row) => (
          <div
            key={row.key}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md"
          >
            {mobileCardRender ? (
              mobileCardRender(row)
            ) : (
              <div className="space-y-3">
                {headers.map((header, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </span>
                    <span className="text-sm font-medium text-gray-900 text-right ml-4">
                      {row.cells[i]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
