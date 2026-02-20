// Payment Type Utilities
// Helper functions for displaying and styling payment types

export const PAYMENT_TYPES = [
  "RENT",
  "ELECTRICITY",
  "WATER",
  "GAS",
  "INTERNET",
  "MAINTENANCE",
  "SECURITY_DEPOSIT",
  "LATE_FEE",
  "OTHER",
] as const

export type PaymentType = typeof PAYMENT_TYPES[number]

/**
 * Format payment type enum value to human-readable string
 * @param type - Payment type enum value (e.g., "RENT", "ELECTRICITY")
 * @returns Formatted string (e.g., "Rent", "Electricity")
 */
export function formatPaymentType(type: string): string {
  const typeMap: Record<string, string> = {
    RENT: "Rent",
    ELECTRICITY: "Electricity",
    WATER: "Water",
    GAS: "Gas",
    INTERNET: "Internet",
    MAINTENANCE: "Maintenance",
    SECURITY_DEPOSIT: "Security Deposit",
    LATE_FEE: "Late Fee",
    OTHER: "Other",
  }
  return typeMap[type] || type
}

/**
 * Get Tailwind CSS classes for payment type badge
 * @param type - Payment type enum value
 * @returns CSS class string for badge styling
 */
export function getPaymentTypeBadgeColor(type: string): string {
  const colorMap: Record<string, string> = {
    RENT: "bg-blue-100 text-blue-800 border-blue-300",
    ELECTRICITY: "bg-yellow-100 text-yellow-800 border-yellow-300",
    WATER: "bg-cyan-100 text-cyan-800 border-cyan-300",
    GAS: "bg-orange-100 text-orange-800 border-orange-300",
    INTERNET: "bg-purple-100 text-purple-800 border-purple-300",
    MAINTENANCE: "bg-red-100 text-red-800 border-red-300",
    SECURITY_DEPOSIT: "bg-green-100 text-green-800 border-green-300",
    LATE_FEE: "bg-red-100 text-red-800 border-red-300",
    OTHER: "bg-gray-100 text-gray-800 border-gray-300",
  }
  return colorMap[type] || "bg-gray-100 text-gray-800 border-gray-300"
}

/**
 * Get emoji icon for payment type (optional visual enhancement)
 * @param type - Payment type enum value
 * @returns Emoji string
 */
export function getPaymentTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    RENT: "🏠",
    ELECTRICITY: "⚡",
    WATER: "💧",
    GAS: "🔥",
    INTERNET: "🌐",
    MAINTENANCE: "🔧",
    SECURITY_DEPOSIT: "🔒",
    LATE_FEE: "⏰",
    OTHER: "📄",
  }
  return iconMap[type] || "📄"
}
