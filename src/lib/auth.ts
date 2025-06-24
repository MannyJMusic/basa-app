import NextAuth, { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import { prisma } from "./db"
import { verifyPassword } from "./utils"
import { loginSchema } from "./validations"

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              member: true
            }
          })

          if (!user || !user.hashedPassword) {
            return null
          }

          const isPasswordValid = await verifyPassword(password, user.hashedPassword)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
            member: user.member
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.isVerified = user.isVerified
        token.member = user.member
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          role: token.role as string,
          isVerified: token.isVerified as boolean,
          member: token.member as any
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (user) {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        // Log sign in
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "SIGN_IN",
            entityType: "USER",
            entityId: user.id,
            newValues: {
              timestamp: new Date().toISOString()
            }
          }
        })
      }
      return true
    },
    async signOut({ token }) {
      if (token?.id) {
        // Log sign out
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: "SIGN_OUT",
            entityType: "USER",
            entityId: token.id as string,
            newValues: {
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    }
  },
  pages: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    error: "/auth/sign-in"
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig) 