import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import type { DatabaseUser } from "@/types/next-auth";

// This will be replaced with actual Prisma database calls once the database is set up
// For now, this is a placeholder structure
const getUserByEmail = async (email: string): Promise<DatabaseUser | null> => {
    // TODO: Replace with Prisma query
    // return await prisma.user.findUnique({ where: { email } });
    return null;
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                // Fetch user from database
                const user = await getUserByEmail(credentials.email);

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                // Verify password using Argon2
                const isValidPassword = await argon2.verify(
                    user.passwordHash,
                    credentials.password
                );

                if (!isValidPassword) {
                    throw new Error("Invalid email or password");
                }

                // Return user object (without password hash)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
