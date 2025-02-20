import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import type { AuthOptions } from "next-auth";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        isGuest: { type: "boolean", optional: true },
      },
      async authorize(credentials) {
        if (credentials?.isGuest) {
          // Create a temporary user in the database
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: "Guest User",
              password: "",
              isGuest: true,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          });
          return user;
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Check if guest account is expired
        if (user.isGuest && user.expiresAt && user.expiresAt < new Date()) {
          // Optionally delete expired guest account
          await prisma.user.delete({
            where: { id: user.id },
          });
          throw new Error("Guest session expired");
        }

        // Regular user password check
        if (!user.isGuest) {
          if (!user.password) {
            throw new Error("Invalid credentials");
          }
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!passwordMatch) {
            throw new Error("Incorrect password");
          }
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        if (user.isGuest) {
          // Check expiration during token creation/refresh
          const guestUser = await prisma.user.findUnique({
            where: { id: user.id },
          });

          if (guestUser?.expiresAt && guestUser.expiresAt < new Date()) {
            // Token for expired guest - force sign out
            return {};
          }

          token.isGuest = true;
          token.expiresAt = user.expiresAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;

        if (token.isGuest) {
          // Check if guest session is expired
          if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
            return null; // Force sign out if expired
          }
          session.user.isGuest = true;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
