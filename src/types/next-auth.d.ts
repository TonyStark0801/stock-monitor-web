import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types to include custom fields
   */
  interface Session {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types to include custom fields
   */
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types to include custom fields
   */
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}
