import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Local credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const configuredEmail = process.env.DEMO_AUTH_EMAIL;
        const configuredPassword = process.env.DEMO_AUTH_PASSWORD;

        if (!configuredEmail || !configuredPassword) {
          return null;
        }

        if (
          parsed.data.email !== configuredEmail ||
          parsed.data.password !== configuredPassword
        ) {
          return null;
        }

        return {
          id: "local-demo-user",
          email: configuredEmail,
          name: "Local Demo User",
        };
      },
    }),
  ],
};
