import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { getRedirectUrl } from "@/lib/utils"
import type { NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

export const authConfig: NextAuthConfig = {
    debug: false,
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      LinkedInProvider({
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          if (typeof credentials.email !== "string") {
            return null
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user || !user.hashedPassword) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            isActive: user.isActive,
          }
        }
      })
    ],
    callbacks: {
      async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.role = user.role
          token.isActive = user.isActive
          token.image = user.image
        }
        
        return token
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (token) {
          session.user = {
            id: token.id as string,
            email: token.email as string,
            firstName: token.firstName as string,
            lastName: token.lastName as string,
            role: token.role as string,
            isActive: token.isActive as boolean,
            image: token.image as string,
          }
        }
        
        return session
      },
      async redirect({ url, baseUrl }) {
        // If the url is relative, prefix it with the base url
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // If the url is on the same origin, allow it
        else if (new URL(url).origin === baseUrl) return url
        // Otherwise, redirect to the dashboard
        return `${baseUrl}/dashboard`
      },
      async signIn({ user, account, profile }: { user: any; account?: any; profile?: any }) {
        if (user) {
          try {
            console.log("SignIn callback - User data:", {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account?.provider
            });

            // For credentials login, we don't need to do anything special
            // as the authorize function already handles validation
            if (!account?.provider) {
              return true;
            }

            // For social logins, check if user exists
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              include: { accounts: true }
            });

            if (existingUser) {
              console.log("Existing user found by email:", existingUser.id);
              
              // Check if this provider account already exists for this user
              if (account?.providerAccountId) {
                const existingAccount = await prisma.account.findUnique({
                  where: {
                    provider_providerAccountId: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId
                    }
                  }
                });

                if (!existingAccount) {
                  // Create the account link
                  await prisma.account.create({
                    data: {
                      userId: existingUser.id,
                      type: account.type,
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      refresh_token: account.refresh_token,
                      access_token: account.access_token,
                      expires_at: account.expires_at,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                      session_state: account.session_state,
                    }
                  });
                }
              }

              // Update last login and image if provided
              const updateData: any = { lastLogin: new Date() };
              if (user.image) {
                updateData.image = user.image;
              }

              await prisma.user.update({
                where: { id: existingUser.id },
                data: updateData
              });

              // Log sign in
              await prisma.auditLog.create({
                data: {
                  userId: existingUser.id,
                  action: "SIGN_IN",
                  entityType: "USER",
                  entityId: existingUser.id,
                  newValues: {
                    timestamp: new Date().toISOString(),
                    provider: account.provider,
                    image: user.image || null
                  }
                }
              });
              
              return true;
            } else {
              // User doesn't exist - redirect to sign up with error
              console.log("New social login user - redirecting to sign up");
              return `/auth/sign-up?error=social_signup_required&provider=${account.provider}&email=${encodeURIComponent(user.email)}`;
            }

          } catch (error) {
            console.error("SignIn error:", error);
            throw error;
          }
        }

        return true;
      },
    },
    pages: {
      signIn: '/auth/sign-in',
      error: '/auth/sign-in',
    },
    session: {
      strategy: "jwt",
    },
  }
  
  // Helper to split a full name into first and last name
  function splitName(name: string | null | undefined) {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return { firstName, lastName };
  }

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig) 