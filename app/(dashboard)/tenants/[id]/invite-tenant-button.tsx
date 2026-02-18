"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle2, Copy } from "lucide-react"

interface InviteTenantButtonProps {
  tenantId: string
  tenantEmail: string
  hasPortalAccess: boolean
}

export default function InviteTenantButton({
  tenantId,
  tenantEmail,
  hasPortalAccess,
}: InviteTenantButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)

  async function handleSendInvite() {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/tenants/${tenantId}/invite`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invite")
      }

      setInviteLink(data.inviteLink)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Don't show button if tenant already has portal access
  if (hasPortalAccess) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        <span>Portal access enabled</span>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-teal-600 text-teal-600 hover:bg-teal-50"
      >
        <Mail className="w-4 h-4 mr-2" />
        Send Portal Invite
      </Button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {!inviteLink ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Send Tenant Portal Invite
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Send an invite to <strong>{tenantEmail}</strong> to access the
                    tenant portal. They'll be able to view their lease, make
                    payments, and submit maintenance requests.
                  </p>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="outline"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendInvite}
                      disabled={isLoading}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Invite
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Invite Sent!
                    </h2>
                    <p className="text-sm text-gray-600">
                      The tenant portal invite has been generated. Share this link
                      with your tenant:
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-900 break-all mb-3">
                      {inviteLink}
                    </p>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-900">
                      <strong>Note:</strong> This invite link expires in 48 hours.
                      Share it with your tenant via email, text, or any messaging
                      app.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      setInviteLink("")
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Done
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
