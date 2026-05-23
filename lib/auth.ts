import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendNotificationEmail, buildWelcomeEmailHtml } from '@/lib/notifications';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) {
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  events: {
    async createUser({ user }: any) {
      // Set 7-day trial for all new users (Google SSO, etc.)
      if (user?.id) {
        try {
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);
          await prisma.user.update({
            where: { id: user.id },
            data: { trialEndsAt },
          });

          // Send welcome email (non-blocking) — for Google SSO users
          if (user?.email) {
            sendNotificationEmail({
              notificationId: process.env.NOTIF_ID_BIENVENIDA_NUEVO_REGISTRO ?? '',
              recipientEmail: user.email,
              subject: '🪙 ¡Bienvenido a NumisCloud! Tu colección te espera',
              body: buildWelcomeEmailHtml(user.name ?? ''),
            }).catch(() => {});
          }
        } catch (e: any) {
          console.error('createUser event error:', e);
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
      }
      // Fetch role + trial from DB
      if (token?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, image: true, trialEndsAt: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            if (!token.name) token.name = dbUser.name;
            if (!token.image) token.image = dbUser.image;

            // Auto-activate trial for FREE users who don't have one
            if (dbUser.role === 'FREE' && !dbUser.trialEndsAt) {
              const trialEndsAt = new Date();
              trialEndsAt.setDate(trialEndsAt.getDate() + 7);
              await prisma.user.update({
                where: { id: token.id as string },
                data: { trialEndsAt },
              });
              token.trialEndsAt = trialEndsAt.toISOString();
            } else {
              token.trialEndsAt = dbUser.trialEndsAt ? dbUser.trialEndsAt.toISOString() : null;
            }
          }
        } catch (e: any) {
          console.error('JWT callback error:', e);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role;
      }
      session.user.trialEndsAt = (token?.trialEndsAt as string) ?? null;
      if (token?.image) {
        session.user.image = token.image;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  cookies: {
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
