import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { approvalDestination } from "@/lib/permissions";

export default function ApprovalsRedirect() {
  const { user } = useAuthContext();
  return <Navigate to={approvalDestination(user)} replace />;
}
