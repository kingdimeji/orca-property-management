// Paystack API Types
// Based on Paystack API documentation: https://paystack.com/docs/api/

// Request to initialize a payment transaction
export interface PaystackInitializeRequest {
  email: string
  amount: number // Amount in kobo (NGN) or lowest currency unit
  currency?: string // NGN, GBP, USD, etc.
  reference?: string // Unique transaction reference
  callback_url?: string // URL to redirect after payment
  metadata?: Record<string, any>
  channels?: string[] // Payment channels to allow
}

// Response from initialize transaction endpoint
export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string // URL to redirect user for payment
    access_code: string
    reference: string
  }
}

// Response from verify transaction endpoint
export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: "success" | "failed" | "abandoned"
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    fees: number
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: Record<string, any>
      risk_action: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
    }
  }
}

// Webhook event payload
export interface PaystackWebhookEvent {
  event: "charge.success" | "charge.failed" | "charge.abandoned" | string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    fees?: number
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: Record<string, any>
      risk_action: string
    }
  }
}

// Error response from Paystack
export interface PaystackErrorResponse {
  status: false
  message: string
  errors?: Record<string, string[]>
}
