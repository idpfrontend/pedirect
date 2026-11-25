import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/r/") ||
        pathname.startsWith("/api/auth");

      if (pathname.startsWith("/api/click-logs")) {
        return isLoggedIn;
      }

      if (isPublic) return true;
      if (pathname === "/") return true;
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
