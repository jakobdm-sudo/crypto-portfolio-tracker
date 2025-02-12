import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Ensure user.id is always a string
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string; // Ensure user.id is always a string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Ensure token.id is a string
  }
}
