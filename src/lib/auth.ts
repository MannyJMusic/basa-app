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
    debug: true, // Force debug mode to see what's happening
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    useSecureCookies: process.env.NODE_ENV === 'production',
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      }),
      // LinkedInProvider({
      //   clientId: process.env.LINKEDIN_CLIENT_ID!,
      //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      // }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          console.log("Credentials login attempt for:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing email or password");
            return null
          }
          if (typeof credentials.email !== "string") {
            console.log("Invalid email format");
            return null
          }
          
          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email as string }
            })

            if (!user) {
              console.log("User not found:", credentials.email);
              return null
            }

            if (!user.hashedPassword) {
              console.log("User has no password set:", credentials.email);
              return null
            }

            if (!user.isActive) {
              console.log("User account is not active:", credentials.email);
              return null
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password as string,
              user.hashedPassword
            )

            if (!isPasswordValid) {
              console.log("Invalid password for user:", credentials.email);
              return null
            }

            console.log("Credentials login successful for:", credentials.email);
            return {
              id: user.id,
              email: user.email || '',
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              role: user.role,
              isActive: user.isActive,
              accountStatus: (user as any).accountStatus,
            }
          } catch (error) {
            console.error("Error during credentials authorization:", error);
            return null;
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
          token.accountStatus = user.accountStatus
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
            accountStatus: token.accountStatus as string,
          }
        }
        
        return session
      },
      async redirect({ url, baseUrl }) {
        console.log("Redirect callback - url:", url, "baseUrl:", baseUrl);
        
        // Handle OAuth callbacks specifically
        if (url.includes("/api/auth/callback")) {
          console.log("OAuth callback detected, redirecting to dashboard");
          return `${baseUrl}/dashboard`;
        }
        
        // If the url is relative, prefix it with the base url
        if (url.startsWith("/")) {
          console.log("Relative URL, prefixing with baseUrl");
          return `${baseUrl}${url}`;
        }
        
        // If the url is on the same origin, allow it
        try {
          const urlObj = new URL(url);
          if (urlObj.origin === baseUrl) {
            console.log("Same origin URL, allowing");
            return url;
          }
        } catch (error) {
          console.log("Invalid URL, redirecting to dashboard");
        }
        
        // For external URLs, redirect to dashboard
        console.log("External URL, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
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
              // User doesn't exist - automatically create account for social login
              console.log("Creating new user account for social login");
              
              // Split name into first and last name
              const { firstName, lastName } = splitName(user.name);
              
              // Create new user
              const newUser = await prisma.user.create({
                data: {
                  email: user.email,
                  firstName: firstName,
                  lastName: lastName,
                  image: user.image,
                  role: "MEMBER",
                  isActive: true,
                  lastLogin: new Date(),
                  // Create the social account link
                  accounts: {
                    create: {
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
                  }
                }
              });

              // Log account creation
              await prisma.auditLog.create({
                data: {
                  userId: newUser.id,
                  action: "ACCOUNT_CREATED",
                  entityType: "USER",
                  entityId: newUser.id,
                  newValues: {
                    timestamp: new Date().toISOString(),
                    provider: account.provider,
                    email: user.email,
                    firstName: firstName,
                    lastName: lastName,
                    image: user.image || null
                  }
                }
              });

              console.log("New user account created:", newUser.id);
              return true;
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
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