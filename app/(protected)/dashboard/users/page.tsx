import { checkUserAccess } from "@/actions/roleActions";
import {
  getAllUsers,
  getAllDepartments,
  getAllApprovalRoles,
} from "@/actions/adminActions"
import { UsersTable } from "@/components/admin/users-table"
import { ErrorDisplay } from "@/components/ui/error-display";
import { fetchData } from "@/lib/error-utils";

export default async function UsersPage() {
  const result = await checkUserAccess();

  if (!result.success) {
    return <ErrorDisplay error={result.error.message} />;
  }

  const data = await fetchData({
    users: getAllUsers(),
    departments: getAllDepartments(),
    approvalRoles: getAllApprovalRoles()
  });

  if (!data.success) {
    return <ErrorDisplay error={data.error} />;
  }

  const { users, departments, approvalRoles } = data.data;

  return (
    <UsersTable
      users={users}
      departments={departments}
      approvalRoles={approvalRoles}
    />
  )
}