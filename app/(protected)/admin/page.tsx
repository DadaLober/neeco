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
    return <div className="text-red-500">Access Denied: Admin privileges required</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <UserManagement />
    </div>
  );
}
