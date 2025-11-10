import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authAPI } from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await authAPI.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.token && response.user) {
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              image: response.user.avatar,
              accessToken: response.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          // For Google OAuth, you might want to register the user with your backend
          // and get a JWT token from your backend
          try {
            // Call your backend to register/login the OAuth user
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/oauth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                avatar: user.image,
                googleId: account.providerAccountId,
                accessToken: account.access_token,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              token.accessToken = data.data?.token || account.access_token;
            } else {
              // Fallback to OAuth access token
              token.accessToken = account.access_token;
            }
          } catch (error) {
            console.error("OAuth backend integration error:", error);
            // Fallback to OAuth access token
            token.accessToken = account.access_token;
          }
        } else {
          // For credentials provider
          token.accessToken = (user as { accessToken?: string }).accessToken;
        }

        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id;
        (session as { accessToken?: string }).accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
