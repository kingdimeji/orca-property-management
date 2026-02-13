import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      country: string
      currency: string
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    country: string
    currency: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    country: string
    currency: string
  }
}
