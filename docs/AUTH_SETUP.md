# Authentication Setup Documentation

## Overview

The Sameeksha Arts Website uses **NextAuth.js** with a **Credentials provider** for secure session-based authentication. This document explains the authentication architecture and how to configure it.

## Security Features

### Password Hashing
- **Argon2** algorithm for password hashing (more secure than bcrypt)
- Automatic salt generation
- Resistant to timing attacks

### Session Management
- **JWT-based sessions** stored in HTTP-only cookies
- **24-hour session expiration** with sliding window
- Sessions automatically refresh on activity

### Cookie Security
- **HTTP-only cookies** prevent XSS attacks
- **SameSite: lax** attribute prevents CSRF attacks
- **Secure flag** enabled in production (HTTPS only)
- Custom cookie name: `next-auth.session-token`

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

#### Generating NEXTAUTH_SECRET

Generate a secure random secret using one of these methods:

**Method 1: OpenSSL (Recommended)**
```bash
openssl rand -base64 32
```

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Online Generator**
Visit: https://generate-secret.vercel.app/32

⚠️ **Important**: Keep this secret confidential and never commit it to version control!

### Production Configuration

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. Ensure `NODE_ENV=production` is set to enable secure cookies

## File Structure

```
app/api/auth/[...nextauth]/
  └── route.ts          # NextAuth configuration and handlers

lib/
  └── auth.ts           # Authentication utility functions

types/
  └── next-auth.d.ts    # TypeScript type extensions for NextAuth
```

## Authentication Flow

### Login Process

1. User submits credentials via login form
2. NextAuth sends credentials to the authorize function
3. System queries database for user by email
4. Password is verified using Argon2
5. On success, JWT token is created and stored in HTTP-only cookie
6. User is redirected to dashboard

### Session Validation

1. On each authenticated request, NextAuth validates the JWT
2. Session data is extracted from the token
3. If token is expired or invalid, user is redirected to login
4. Active sessions automatically refresh their expiration

### Logout Process

1. User clicks logout button
2. NextAuth clears the session cookie
3. User is redirected to login page

## API Usage

### Server-Side Components

```typescript
import { getSession, getCurrentUser, isAuthenticated } from "@/lib/auth";

// Get full session
const session = await getSession();

// Get current user
const user = await getCurrentUser();

// Check authentication status
const authenticated = await isAuthenticated();
```

### Client-Side Components

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### API Routes

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
  
  // Handle authenticated request
  return NextResponse.json({ data: "Protected data" });
}
```

## Password Utilities

The `lib/auth.ts` file provides password hashing utilities:

```typescript
import { hashPassword, verifyPassword } from "@/lib/auth";

// Hash a password (for user registration or password change)
const hashedPassword = await hashPassword("userPassword123");

// Verify a password (handled automatically by NextAuth in login)
const isValid = await verifyPassword(storedHash, "userPassword123");
```

## Database Integration

⚠️ **Note**: The current implementation uses a placeholder `getUserByEmail` function. This needs to be replaced with actual Prisma database queries once the database is set up.

### TODO: Update Authentication with Database

In `app/api/auth/[...nextauth]/route.ts`, replace the placeholder:

```typescript
// Replace this:
const getUserByEmail = async (email: string) => {
  return null;
};

// With this (once Prisma is set up):
import { prisma } from "@/lib/prisma";

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });
};
```

## Session Configuration

Current session settings:

- **Strategy**: JWT (stateless)
- **Max Age**: 24 hours (86,400 seconds)
- **Sliding Window**: Yes (session extends on activity)
- **Cookie Path**: `/` (all routes)
- **Cookie SameSite**: `lax`
- **Cookie Secure**: Enabled in production

### Customizing Session Duration

To change the session duration, modify `session.maxAge` in `authOptions`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60, // 7 days
},
```

## Custom Pages

Authentication pages are configured to use custom routes:

- **Sign In Page**: `/admin/login`
- **Error Page**: `/admin/login` (with error query parameter)

These pages need to be created as part of the dashboard implementation.

## Security Best Practices

1. ✅ **HTTP-only cookies** - Prevents JavaScript access to tokens
2. ✅ **Argon2 password hashing** - Industry-leading password security
3. ✅ **SameSite cookies** - Prevents CSRF attacks
4. ✅ **Secure flag in production** - HTTPS-only cookies
5. ✅ **Session expiration** - Limits exposure window
6. ⚠️ **CSRF protection** - NextAuth provides automatic CSRF tokens
7. ⚠️ **Rate limiting** - Should be added to login endpoint (future enhancement)

## Testing

### Manual Testing Checklist

Once the database and login UI are implemented:

- [ ] Login with valid credentials succeeds
- [ ] Login with invalid email fails
- [ ] Login with invalid password fails
- [ ] Session persists across page refreshes
- [ ] Session expires after 24 hours
- [ ] Logout clears session
- [ ] Protected routes redirect to login when not authenticated
- [ ] Session cookie has httpOnly flag
- [ ] Session cookie has sameSite flag
- [ ] Session cookie has secure flag in production

## Troubleshooting

### Common Issues

**Issue**: "NEXTAUTH_SECRET not set"
- **Solution**: Add `NEXTAUTH_SECRET` to your `.env.local` file

**Issue**: "Invalid session token"
- **Solution**: Clear browser cookies or regenerate NEXTAUTH_SECRET

**Issue**: "User not found" or "Invalid password"
- **Solution**: Verify database connection and user exists with correct password hash

**Issue**: Session not persisting
- **Solution**: Check that cookies are enabled and NEXTAUTH_URL matches your domain

## Next Steps

1. ✅ NextAuth.js installed and configured
2. ✅ Authentication API routes created
3. ⏳ Set up Prisma database and User model (Task 2.2)
4. ⏳ Create authentication middleware for protected routes (Task 3.2)
5. ⏳ Build login page UI (Phase 5, Task 29.2)
6. ⏳ Build dashboard with protected routes (Phase 5)

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2)
- [Next.js 14 App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
