# Quick Start: Authentication

This guide will help you quickly set up and use the authentication system.

## Setup (5 minutes)

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` (if not already done):

```bash
cp .env.example .env.local
```

### 2. Generate NEXTAUTH_SECRET

Run one of these commands:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Update .env.local

Paste the generated secret:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

### 4. Start Development Server

```bash
npm run dev
```

## Using Authentication in Your Code

### Check if User is Logged In (Server Component)

```typescript
import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Protect an API Route

```typescript
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Your protected logic here
  return NextResponse.json({ data: "Protected data" });
}
```

### Client Component with Session

```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function ClientComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Hello, {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## What's Next?

Once you have the database set up (Task 2.2), you'll need to:

1. Update the `getUserByEmail` function in `app/api/auth/[...nextauth]/route.ts` to use Prisma
2. Create a login page at `app/admin/login/page.tsx`
3. Add authentication middleware to protect admin routes (Task 3.2)

## API Endpoints

NextAuth automatically creates these endpoints:

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get available providers
- `GET /api/auth/csrf` - Get CSRF token

## Troubleshooting

**Error**: "NEXTAUTH_SECRET not set"
- Add `NEXTAUTH_SECRET` to `.env.local`

**Error**: Session not persisting
- Clear browser cookies
- Check that `NEXTAUTH_URL` matches your current URL

**Need Help?**
- See full documentation: `docs/AUTH_SETUP.md`
- NextAuth.js docs: https://next-auth.js.org/
