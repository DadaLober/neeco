import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/actions/roleActions';
import { UserManagement } from '@/components/admin/UserManagement';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  console.log(session);

  const userRole = session?.user?.role;

  if (!(await isAdmin(userRole))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
        <div className="text-center bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have the required admin privileges to access this page.</p>
          <a 
            href="/dashboard" 
            className="inline-block bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">Admin Dashboard</h1>
      <UserManagement />
    </div>
  );
}
