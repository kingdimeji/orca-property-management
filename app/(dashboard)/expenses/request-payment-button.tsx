"use client"

import { useState } from "react"
import { SendHorizonal } from "lucide-react"

interface RequestPaymentButtonProps {
  expenseId: string
}

export default function RequestPaymentButton({ expenseId }: RequestPaymentButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")
  const [message, setMessage] = useState("")

  async function handleClick() {
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch(`/api/expenses/${expenseId}/request-payment`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to request payment")
      }

      setStatus("done")
      setMessage(data.message)
    } catch (err) {
      setStatus("idle")
      setMessage(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  if (status === "done") {
    return (
      <span className="text-xs text-green-600 font-medium" title={message}>
        Sent
      </span>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        title="Request payment from tenants"
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <SendHorizonal className="w-3.5 h-3.5" />
        {status === "loading" ? "Sending..." : "Request Payment"}
      </button>
      {message && (
        <span className="text-xs text-red-500">{message}</span>
      )}
    </div>
  )
}
