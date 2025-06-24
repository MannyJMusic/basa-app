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

// Debug logging function
function debugLog(context: string, data: any) {
  console.log(`🔍 [AUTH DEBUG - ${context}]`, JSON.stringify(data, null, 2))
}

export const authConfig: NextAuthConfig = {
    // ...existing config...
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
      // ...existing providers...
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
          debugLog("CREDENTIALS_AUTHORIZE", { email: credentials?.email, hasPassword: !!credentials?.password })
          
          if (!credentials?.email || !credentials?.password) {
            debugLog("CREDENTIALS_MISSING", { email: !!credentials?.email, password: !!credentials?.password })
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          debugLog("CREDENTIALS_USER_LOOKUP", { found: !!user, userId: user?.id })

          if (!user || !user.hashedPassword) {
            debugLog("CREDENTIALS_USER_NOT_FOUND_OR_NO_PASSWORD", { hasUser: !!user, hasPassword: !!user?.hashedPassword })
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword as string
          )

          debugLog("CREDENTIALS_PASSWORD_VALIDATION", { isValid: isPasswordValid })

          if (!isPasswordValid) {
            return null
          }

          const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
          }

          debugLog("CREDENTIALS_AUTHORIZED_USER", userData)
          return userData
        }
      })
    ],
    // ...rest of config...
    callbacks: {
      async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
        debugLog("JWT_CALLBACK_START", { 
          tokenId: token.id, 
          userId: user?.id, 
          accountProvider: account?.provider,
          accountType: account?.type 
        })

        if (user) {
          debugLog("JWT_USER_DATA", { 
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
            userIsActive: user.isActive
          })
          
          token.id = user.id
          token.email = user.email
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.role = user.role
          token.isActive = user.isActive
        }

        debugLog("JWT_FINAL_TOKEN", { 
          tokenId: token.id,
          tokenEmail: token.email,
          tokenRole: token.role
        })
        
        return token
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        debugLog("SESSION_CALLBACK_START", { 
          sessionUserEmail: session.user?.email,
          tokenId: token.id,
          tokenEmail: token.email
        })

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

        debugLog("SESSION_FINAL", { 
          sessionUserId: session.user?.id,
          sessionUserEmail: session.user?.email,
          sessionUserRole: session.user?.role
        })
        
        return session
      },
      async signIn({ user, account, profile }: { user: any; account?: any; profile?: any }) {
        debugLog("SIGNIN_CALLBACK_START", {
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.name,
          accountProvider: account?.provider,
          accountType: account?.type,
          accountProviderAccountId: account?.providerAccountId,
          profileId: profile?.sub,
          profileEmail: profile?.email
        })

        if (user) {
          try {
            // Check if user exists by id
            let dbUser = await prisma.user.findUnique({ 
              where: { id: user.id },
              include: { accounts: true }
            });
            debugLog("SIGNIN_USER_LOOKUP_BY_ID", { 
              found: !!dbUser, 
              userId: user.id,
              dbUserId: dbUser?.id,
              dbUserEmail: dbUser?.email,
              existingAccounts: dbUser?.accounts?.length || 0
            })

            if (dbUser) {
              debugLog("SIGNIN_EXISTING_USER_FOUND", {
                userId: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                role: dbUser.role,
                accounts: dbUser.accounts.map((acc: any) => ({
                  provider: acc.provider,
                  providerAccountId: acc.providerAccountId,
                  type: acc.type
                }))
              })

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
                
                debugLog("SIGNIN_ACCOUNT_LOOKUP", {
                  found: !!existingAccount,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accountId: existingAccount?.id
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
                  debugLog("SIGNIN_ACCOUNT_CREATED", {
                    userId: dbUser.id,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId
                  });
                }
              }

              // Update last login
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { lastLogin: new Date() }
              });
              debugLog("SIGNIN_LAST_LOGIN_UPDATED", { userId: dbUser.id })

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
              debugLog("SIGNIN_AUDIT_LOG_CREATED", { userId: dbUser.id })
              return true;
            }

            // User doesn't exist, check by email for social logins
            if (account?.provider && user.email) {
              const existingByEmail = await prisma.user.findUnique({ 
                where: { email: user.email },
                include: { accounts: true }
              });
              debugLog("SIGNIN_EMAIL_LOOKUP", { 
                found: !!existingByEmail, 
                email: user.email,
                existingUserId: existingByEmail?.id,
                existingAccounts: existingByEmail?.accounts?.length || 0
              })

              if (existingByEmail) {
                debugLog("SIGNIN_EXISTING_EMAIL_FOUND", {
                  userId: existingByEmail.id,
                  email: existingByEmail.email,
                  provider: account.provider,
                  accounts: existingByEmail.accounts.map((acc: any) => ({
                    provider: acc.provider,
                    providerAccountId: acc.providerAccountId,
                    type: acc.type
                  }))
                })

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
                  
                  debugLog("SIGNIN_EXISTING_EMAIL_ACCOUNT_LOOKUP", {
                    found: !!existingAccount,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId
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
                    debugLog("SIGNIN_EXISTING_EMAIL_ACCOUNT_CREATED", {
                      userId: existingByEmail.id,
                      provider: account.provider,
                      providerAccountId: account.providerAccountId
                    });
                  }
                }

                // Update last login
                await prisma.user.update({
                  where: { id: existingByEmail.id },
                  data: { lastLogin: new Date() }
                });
                debugLog("SIGNIN_EXISTING_EMAIL_LAST_LOGIN_UPDATED", { userId: existingByEmail.id })

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
                debugLog("SIGNIN_EXISTING_EMAIL_AUDIT_LOG_CREATED", { userId: existingByEmail.id })
                return true;
              }
            }

            // Create new user for social login
            if (account?.provider) {
              const { firstName, lastName } = splitName(user.name);
              debugLog("SIGNIN_CREATING_NEW_USER", {
                userId: user.id,
                email: user.email,
                firstName,
                lastName,
                provider: account.provider,
                providerAccountId: account.providerAccountId
              })

              // Create the user first
              dbUser = await prisma.user.create({
                data: {
                  id: user.id,
                  email: user.email,
                  firstName,
                  lastName,
                  isActive: true,
                  role: 'MEMBER',
                }
              });

              debugLog("SIGNIN_NEW_USER_CREATED", {
                userId: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                role: dbUser.role
              })

              // Create the account link
              if (account?.providerAccountId) {
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
                debugLog("SIGNIN_NEW_USER_ACCOUNT_CREATED", {
                  userId: dbUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId
                });
              }

              // Update last login
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { lastLogin: new Date() }
              });
              debugLog("SIGNIN_NEW_USER_LAST_LOGIN_UPDATED", { userId: dbUser.id })

              // Log sign in
              await prisma.auditLog.create({
                data: {
                  userId: dbUser.id,
                  action: "SIGN_IN",
                  entityType: "USER",
                  entityId: dbUser.id,
                  newValues: {
                    timestamp: new Date().toISOString(),
                    provider: account.provider,
                    isNewUser: true
                  }
                }
              });
              debugLog("SIGNIN_NEW_USER_AUDIT_LOG_CREATED", { userId: dbUser.id })
            }
          } catch (error) {
            debugLog("SIGNIN_ERROR", { 
              error: error instanceof Error ? error.message : String(error),
              userId: user.id,
              userEmail: user.email
            })
            throw error;
          }
        }

        debugLog("SIGNIN_CALLBACK_COMPLETE", { success: true })
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