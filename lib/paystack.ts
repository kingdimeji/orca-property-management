// Paystack API wrapper using native fetch
// Documentation: https://paystack.com/docs/api/

import type {
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from "@/types/paystack"

const PAYSTACK_API_BASE = "https://api.paystack.co"

// Get secret key from environment
function getSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }
  return secretKey
}

// Initialize a payment transaction
export async function initializeTransaction(
  request: PaystackInitializeRequest
): Promise<PaystackInitializeResponse> {
  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to initialize Paystack transaction"
    )
  }

  return data
}

// Verify a transaction by reference
export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Failed to verify Paystack transaction")
  }

  return data
}
