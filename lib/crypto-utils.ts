// Crypto utilities for webhook signature verification
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Verify Paystack webhook signature using HMAC SHA512
 * @param payload - Raw request body as string
 * @param signature - x-paystack-signature header value
 * @param secret - Paystack secret key
 * @returns true if signature is valid, false otherwise
 */
export function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Compute HMAC SHA512 hash of the payload
    const hash = createHmac("sha512", secret).update(payload).digest("hex")

    // Use timing-safe comparison to prevent timing attacks
    if (hash.length !== signature.length) {
      return false
    }

    const hashBuffer = Buffer.from(hash, "utf8")
    const signatureBuffer = Buffer.from(signature, "utf8")

    return timingSafeEqual(hashBuffer, signatureBuffer)
  } catch (error) {
    console.error("Error verifying Paystack signature:", error)
    return false
  }
}
