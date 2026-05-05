import type { NextAuthConfig } from "next-auth";

export const authConfig: Pick<NextAuthConfig, "trustHost" | "session" | "pages" | "callbacks"> = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const u = auth?.user;

      if (path.startsWith("/admin"))
        return !!u?.role && u.role === "ADMIN";
      if (path.startsWith("/mentor"))
        return !!u?.role && (u.role === "MENTOR" || u.role === "ADMIN");
      if (path.startsWith("/dashboard")) return !!u;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
