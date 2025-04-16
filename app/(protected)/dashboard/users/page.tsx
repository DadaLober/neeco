import { auth } from "@/auth";
import { isAdmin } from "@/actions/roleActions";
import {
  getAllUsers,
  getAllDepartments,
  getAllApprovalRoles,
} from "@/actions/adminActions"
import { UsersTable } from "@/components/admin/users-table"
import AccessDeniedPage from "@/components/admin/access-denied"
import { ErrorDisplay } from "@/components/ui/error-display";
import { fetchData } from "@/lib/error-utils";

export default async function UsersPage() {
  const session = await auth();
  if (!(await isAdmin(session) || !session)) {
    return <AccessDeniedPage />
  }

  const result = await fetchData({
    users: getAllUsers(),
    departments: getAllDepartments(),
    approvalRoles: getAllApprovalRoles()
  });

  if (!result.success) {
    return <ErrorDisplay error={result.error} />;
  }

  const { users, departments, approvalRoles } = result.data;

  return (
    <UsersTable
      users={users}
      departments={departments}
      approvalRoles={approvalRoles}
    />
  )
}