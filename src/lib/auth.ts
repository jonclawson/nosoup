import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
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
          where: {
            email: credentials.email
          }
        })

        if (!user || !(user as any).password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          (user as any).password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        
        // Always fetch fresh user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! }
        })
        
        if (dbUser) {
          session.user.role = dbUser.role
        } else {
          session.user.role = token.role as string
        }
      }
      return session
    },
    async signIn({ user }) {
      // Force refresh user data from database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      })
      if (dbUser) {
        user.role = dbUser.role
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to articles page after successful sign in
      return `${baseUrl}/articles`
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
} 