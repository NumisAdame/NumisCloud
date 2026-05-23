import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: UserRole;
      trialEndsAt?: string | null;
    };
  }
  interface User {
    role?: UserRole;
    trialEndsAt?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    trialEndsAt?: string | null;
  }
}
