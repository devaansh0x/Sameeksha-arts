# Login Endpoint — POST /api/auth/login

> **Task 13.1** — Implements Requirements 9.1, 9.2, 9.3

## How the Login Flow Works

The login endpoint is provided by **NextAuth.js** and is NOT a hand-rolled route.
Clients call it indirectly via the NextAuth Credentials flow.

### Endpoint

```
POST /api/auth/callback/credentials
```

This URL is handled automatically by the `[...nextauth]` catch-all route at
`app/api/auth/[...nextauth]/route.ts`.

### Triggering a Login (Client Side)

```typescript
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  email: "admin@example.com",
  password: "secret",
  redirect: false, // handle result manually
});

if (result?.error) {
  // Invalid credentials — show error to user (Req 9.3)
} else {
  // Success — session cookie is now set (Req 9.2)
  router.push("/admin");
}
```

### What Happens on the Server

1. **Input validation** — NextAuth checks that both `email` and `password` fields are present. Missing fields throw `"Email and password are required"`.

2. **User lookup** — `getUserByEmail(email)` queries the database for the user record.
   - Currently a placeholder returning `null` (TODO: replace with Prisma query once DB is wired).
   - Returns a `DatabaseUser` object `{ id, email, name, passwordHash }` on a real database.

3. **Password verification** — `argon2.verify(user.passwordHash, credentials.password)` compares the submitted password against the stored Argon2 hash.

4. **Session creation** — On success, NextAuth:
   - Creates a signed JWT containing `{ id, email, name }`.
   - Sets an HTTP-only, SameSite=lax cookie named `next-auth.session-token`.
   - Session max-age is **24 hours** (Req 9.4).

5. **Failure** — On incorrect credentials, NextAuth returns a `401`-style response (internally a redirect to `/admin/login?error=CredentialsSignin`).

### Key Files

| File | Role |
|---|---|
| `app/api/auth/[...nextauth]/route.ts` | Registers NextAuth GET + POST handlers |
| `lib/auth-options.ts` | Credentials provider, session config, JWT/session callbacks |
| `lib/auth.ts` | Server-side helpers: `getSession()`, `getCurrentUser()`, `isAuthenticated()`, `hashPassword()`, `verifyPassword()` |

### Session Cookie Details

| Property | Value |
|---|---|
| Name | `next-auth.session-token` |
| Strategy | JWT (stateless) |
| Max Age | 24 hours |
| HttpOnly | ✅ |
| SameSite | lax |
| Secure | production only |

### TODO: Wire Up Database

Replace the placeholder in `lib/auth-options.ts`:

```typescript
// Current placeholder
const getUserByEmail = async (email: string): Promise<DatabaseUser | null> => {
  return null; // ← replace with Prisma call
};

// Replace with:
import { prisma } from "@/lib/prisma";

const getUserByEmail = async (email: string): Promise<DatabaseUser | null> => {
  return await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });
};
```

### Tests

Run the auth test suite:

```bash
npx jest lib/auth.test.ts --no-coverage
```

Covers:
- `hashPassword` — produces valid Argon2 hashes, unique per call, handles edge cases
- `verifyPassword` — correct/incorrect/empty/invalid-hash/case-sensitivity
- `getSession` — returns session or null depending on authentication state
- `getCurrentUser` — returns user object or undefined
- `isAuthenticated` — returns boolean auth status

All 19 tests pass.
