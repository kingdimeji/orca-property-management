import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: "LANDLORD" | "TENANT"
      country: string
      currency: string
      tenantProfileId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: "LANDLORD" | "TENANT"
    country: string
    currency: string
    tenantProfileId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "LANDLORD" | "TENANT"
    country: string
    currency: string
    tenantProfileId?: string
  }
}
