"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PayNowButtonProps {
  paymentId: string
}

export function PayNowButton({ paymentId }: PayNowButtonProps) {
  const [isInitiating, setIsInitiating] = useState(false)
  const router = useRouter()

  async function handlePayNow() {
    setIsInitiating(true)

    try {
      const response = await fetch(
        `/api/tenant-portal/payments/${paymentId}/initiate`,
        {
          method: "POST",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Failed to initiate payment")
        setIsInitiating(false)
        return
      }

      // Redirect to payment page with reference
      if (data.reference) {
        router.push(`/pay/${data.reference}`)
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      alert("Failed to initiate payment. Please try again.")
      setIsInitiating(false)
    }
  }

  return (
    <Button
      size="sm"
      className="bg-teal-600 hover:bg-teal-700"
      onClick={handlePayNow}
      disabled={isInitiating}
    >
      {isInitiating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Initiating...
        </>
      ) : (
        "Pay Now"
      )}
    </Button>
  )
}
