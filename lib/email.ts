/**
 * Email Service using Resend
 * Handles all email notifications for Orca Property Management
 */

import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email (must be verified domain in Resend)
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev"
const APP_NAME = "Orca Property Management"
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send email using Resend
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: from || FROM_EMAIL,
      to: [to],
      subject,
      html,
    })

    console.log("Email sent successfully:", { to, subject, id: data.id })
    return { success: true, id: data.id }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error }
  }
}

/**
 * Send tenant portal invite email
 */
export async function sendTenantInviteEmail(
  tenantEmail: string,
  tenantName: string,
  landlordName: string,
  propertyName: string | null,
  inviteLink: string,
  expiryDate: Date
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🏠 ${APP_NAME}</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Welcome to Your Tenant Portal!</h2>

    <p style="color: #4b5563; font-size: 16px;">Hi ${tenantName},</p>

    <p style="color: #4b5563; font-size: 16px;">
      ${landlordName} has invited you to access your tenant portal for
      <strong>${propertyName || "your rental property"}</strong>.
    </p>

    <p style="color: #4b5563; font-size: 16px;">
      Your portal gives you 24/7 access to:
    </p>

    <ul style="color: #4b5563; font-size: 16px; padding-left: 20px;">
      <li>View your lease details</li>
      <li>Track rent payments</li>
      <li>Make online payments</li>
      <li>Submit maintenance requests</li>
      <li>Communicate with your landlord</li>
    </ul>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${inviteLink}" style="background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
        Accept Invite & Create Account
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <strong>⏰ This invite expires on ${expiryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</strong>
    </p>

    <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${inviteLink}" style="color: #0ea5e9; word-break: break-all;">${inviteLink}</a>
    </p>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim()

  return sendEmail({
    to: tenantEmail,
    subject: `${landlordName} invited you to ${APP_NAME}`,
    html,
  })
}

/**
 * Send payment confirmation email to tenant
 */
export async function sendPaymentConfirmationEmail(
  tenantEmail: string,
  tenantName: string,
  amount: number,
  currency: string,
  paidDate: Date,
  propertyName: string,
  unitName: string,
  reference: string
) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Received</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Payment Confirmation</h2>

    <p style="color: #4b5563; font-size: 16px;">Hi ${tenantName},</p>

    <p style="color: #4b5563; font-size: 16px;">
      We've received your rent payment. Thank you for paying on time!
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; font-size: 18px;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Property:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${propertyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Unit:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${unitName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${paidDate.toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Reference:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px;">${reference}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/tenant-portal/payments" style="background: #0ea5e9; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        View Payment History
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin-top: 30px; text-align: center;">
      Keep this email for your records. You can also access your payment history anytime in your tenant portal.
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim()

  return sendEmail({
    to: tenantEmail,
    subject: `Payment Received - ${formattedAmount} for ${propertyName}`,
    html,
  })
}

/**
 * Send new maintenance request notification to landlord
 */
export async function sendMaintenanceRequestEmail(
  landlordEmail: string,
  landlordName: string,
  tenantName: string,
  propertyName: string,
  unitName: string,
  title: string,
  description: string,
  priority: string,
  requestId: string
) {
  const priorityColors: Record<string, string> = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
    URGENT: "#dc2626",
  }

  const priorityColor = priorityColors[priority] || "#6b7280"

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔧 New Maintenance Request</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Maintenance Request Received</h2>

    <p style="color: #4b5563; font-size: 16px;">Hi ${landlordName},</p>

    <p style="color: #4b5563; font-size: 16px;">
      <strong>${tenantName}</strong> has submitted a new maintenance request for <strong>${propertyName} - ${unitName}</strong>.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <div style="margin-bottom: 15px;">
        <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
          ${priority} PRIORITY
        </span>
      </div>

      <h3 style="color: #1f2937; margin: 15px 0 10px 0; font-size: 18px;">${title}</h3>
      <p style="color: #4b5563; font-size: 15px; margin: 0; white-space: pre-wrap;">${description}</p>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>⚠️ Action Required:</strong> Please review and respond to this request promptly.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/dashboard/maintenance/${requestId}" style="background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
        View & Respond to Request
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">
      <strong>Property:</strong> ${propertyName}<br>
      <strong>Unit:</strong> ${unitName}<br>
      <strong>Tenant:</strong> ${tenantName}<br>
      <strong>Request ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${requestId}</code>
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim()

  return sendEmail({
    to: landlordEmail,
    subject: `🔧 ${priority} Priority: New Maintenance Request - ${propertyName}`,
    html,
  })
}

/**
 * Send maintenance status update email to tenant
 */
export async function sendMaintenanceStatusUpdateEmail(
  tenantEmail: string,
  tenantName: string,
  propertyName: string,
  unitName: string,
  title: string,
  oldStatus: string,
  newStatus: string,
  notes: string | null,
  requestId: string
) {
  const statusColors: Record<string, string> = {
    OPEN: "#6b7280",
    IN_PROGRESS: "#f59e0b",
    COMPLETED: "#10b981",
    CANCELLED: "#ef4444",
  }

  const newStatusColor = statusColors[newStatus] || "#6b7280"

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Maintenance Update</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Status Update</h2>

    <p style="color: #4b5563; font-size: 16px;">Hi ${tenantName},</p>

    <p style="color: #4b5563; font-size: 16px;">
      There's an update on your maintenance request for <strong>${propertyName} - ${unitName}</strong>.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">${title}</h3>

      <div style="margin: 20px 0;">
        <span style="background: ${newStatusColor}; color: white; padding: 6px 16px; border-radius: 4px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
          ${newStatus.replace(/_/g, " ")}
        </span>
      </div>

      ${
        notes
          ? `
      <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">NOTES FROM LANDLORD:</p>
        <p style="margin: 0; color: #1f2937; font-size: 15px; white-space: pre-wrap;">${notes}</p>
      </div>
      `
          : ""
      }
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/tenant-portal/maintenance/${requestId}" style="background: #0ea5e9; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        View Full Details
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin-top: 30px; text-align: center;">
      ${
        newStatus === "COMPLETED"
          ? "If you have any concerns about the completed work, please contact your landlord."
          : "We'll keep you updated as progress continues."
      }
    </p>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
    <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
  </div>

</body>
</html>
  `.trim()

  return sendEmail({
    to: tenantEmail,
    subject: `Maintenance Update: ${title} - ${newStatus.replace(/_/g, " ")}`,
    html,
  })
}
