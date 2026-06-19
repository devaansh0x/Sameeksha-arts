/**
 * Admin Dashboard Overview Page
 * 
 * This is a protected route that requires authentication.
 * The middleware will redirect unauthenticated users to /admin/login.
 * 
 * Requirements: 9.2, 9.3, 28.1
 */

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600">
                    Welcome to the Sameeksha Arts admin panel. This page is protected by authentication middleware.
                </p>

                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Protected Content
                    </h2>
                    <p className="text-gray-600">
                        If you can see this page, the authentication middleware is working correctly.
                    </p>
                </div>
            </div>
        </div>
    );
}
