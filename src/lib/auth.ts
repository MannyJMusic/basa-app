import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

export const authConfig: NextAuthConfig = {
    debug: false,
    adapter: PrismaAdapter(prisma),
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

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.hashedPassword) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword as string
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
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
          }
        }
        
        return session
      },
      async signIn({ user, account, profile }: { user: any; account?: any; profile?: any }) {
        if (user) {
          try {
            // Check if user exists by id
            let dbUser = await prisma.user.findUnique({ 
              where: { id: user.id },
              include: { accounts: true }
            });

            if (dbUser) {
              // Check if this provider account already exists
              if (account?.provider && account?.providerAccountId) {
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
                      userId: dbUser.id,
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

              // Update last login
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { lastLogin: new Date() }
              });

              // Log sign in
              await prisma.auditLog.create({
                data: {
                  userId: dbUser.id,
                  action: "SIGN_IN",
                  entityType: "USER",
                  entityId: dbUser.id,
                  newValues: {
                    timestamp: new Date().toISOString(),
                    provider: account?.provider || 'credentials'
                  }
                }
              });
              return true;
            }

            // User doesn't exist, check by email for social logins
            if (account?.provider && user.email) {
              const existingByEmail = await prisma.user.findUnique({ 
                where: { email: user.email },
                include: { accounts: true }
              });

              if (existingByEmail) {
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
                        userId: existingByEmail.id,
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

                // Update last login
                await prisma.user.update({
                  where: { id: existingByEmail.id },
                  data: { lastLogin: new Date() }
                });

                // Log sign in
                await prisma.auditLog.create({
                  data: {
                    userId: existingByEmail.id,
                    action: "SIGN_IN",
                    entityType: "USER",
                    entityId: existingByEmail.id,
                    newValues: {
                      timestamp: new Date().toISOString(),
                      provider: account.provider
                    }
                  }
                });
                return true;
              }
            }

            // For new social login users, redirect to sign-up page
            if (account?.provider) {
              // Store the social login data in the session for the sign-up page
              return `/auth/sign-up?provider=${account.provider}&email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.name || '')}`
            }
          } catch (error) {
            console.error("SignIn error:", error);
            throw error;
          }
        }

        return true;
      }
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