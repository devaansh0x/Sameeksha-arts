# Authentication Middleware Testing Guide

## Overview

The authentication middleware protects all `/admin/*` routes except `/admin/login`. This guide explains how to test the middleware functionality.

## Requirements Implemented

- **Requirement 9.2**: Middleware validates sessions and grants access to authenticated users
- **Requirement 9.3**: Middleware displays error message and denies access to unauthenticated users (via redirect)

## How the Middleware Works

1. **Protected Routes**: All routes matching `/admin/*` except `/admin/login`
2. **Session Validation**: Uses NextAuth.js JWT tokens to verify authentication
3. **Redirect Logic**: Unauthenticated users are automatically redirected to `/admin/login`
4. **Callback URL**: After successful login, users are redirected back to the page they were trying to access

## Manual Testing Steps

### Test 1: Access Protected Route Without Authentication

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin` in your browser
3. **Expected Result**: You should be automatically redirected to `/admin/login`
4. **Status**: ✅ Middleware is working correctly

### Test 2: Login and Access Protected Route

1. Navigate to `http://localhost:3000/admin/login`
2. Enter valid credentials (email and password)
3. Click "Sign in"
4. **Expected Result**: 
   - If credentials are valid, you should be redirected to `/admin` dashboard
   - If credentials are invalid, you should see an error message: "Invalid email or password"

**Note**: Currently, the database needs to be set up with a user account for login to work. See Prisma setup in task 2.2 and 2.3.

### Test 3: Access Login Page While Authenticated

1. After successfully logging in (from Test 2)
2. Navigate to `http://localhost:3000/admin/login`
3. **Expected Result**: You can access the login page (it's not protected)
4. Try navigating to `/admin` - you should have access without being redirected

### Test 4: Logout and Verify Protection

1. While logged in, call the logout function: `signOut()` from NextAuth
2. Try accessing `http://localhost:3000/admin`
3. **Expected Result**: You should be redirected back to `/admin/login`

### Test 5: Callback URL After Login

1. While logged out, navigate to a protected route: `http://localhost:3000/admin/settings`
2. **Expected Result**: You should be redirected to `/admin/login?callbackUrl=/admin/settings`
3. After successful login, you should be redirected back to `/admin/settings`

## Route Protection Matrix

| Route | Protected? | Redirects to Login? |
|-------|-----------|-------------------|
| `/` | No | No |
| `/about` | No | No |
| `/work` | No | No |
| `/admin/login` | No | No |
| `/admin` | Yes | Yes (if not authenticated) |
| `/admin/dashboard` | Yes | Yes (if not authenticated) |
| `/admin/artwork` | Yes | Yes (if not authenticated) |
| `/admin/*` (any admin route) | Yes | Yes (if not authenticated) |

## Implementation Details

### Middleware Configuration

**File**: `middleware.ts`

```typescript
export const config = {
  matcher: [
    // Protect all admin routes except login
    "/admin/((?!login).*)",
  ],
};
```

This regex pattern:
- Matches all routes starting with `/admin/`
- Uses negative lookahead `(?!login)` to exclude `/admin/login`
- Protects routes like `/admin`, `/admin/dashboard`, `/admin/settings`, etc.

### Authorization Callback

```typescript
callbacks: {
  authorized: ({ token }) => {
    // User is authorized if they have a valid session token
    return !!token;
  },
}
```

This callback:
- Receives the JWT token from NextAuth.js session
- Returns `true` if token exists (user is authenticated)
- Returns `false` if token is null/undefined (user is not authenticated)

## Troubleshooting

### Issue: Middleware doesn't redirect to login

**Solution**: 
1. Check that `middleware.ts` is in the root directory
2. Verify `NEXTAUTH_SECRET` is set in `.env.local`
3. Ensure Next.js dev server was restarted after creating middleware

### Issue: Login page is also protected

**Solution**: 
- Check the matcher pattern in `middleware.ts`
- The pattern should exclude `/admin/login`: `/admin/((?!login).*)`

### Issue: "Invalid email or password" error on valid credentials

**Solution**: 
- Ensure database is set up and seeded with user account
- Check `lib/auth-options.ts` is correctly querying the database
- Verify Argon2 password hashing is working correctly

## Next Steps

1. **Task 2.2 & 2.3**: Set up database with Prisma and seed a user account
2. **Task 13.1**: Complete the login API endpoint with real database queries
3. **Task 29.1**: Build the full dashboard layout with navigation
4. **Task 37.1**: Add logout functionality in settings page

## Security Notes

- Session tokens are stored in HTTP-only cookies (cannot be accessed by JavaScript)
- Sessions expire after 24 hours (configured in `auth-options.ts`)
- Middleware runs on every request to protected routes (server-side validation)
- CSRF protection is automatically handled by NextAuth.js
