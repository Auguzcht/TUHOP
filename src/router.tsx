import { createBrowserRouter, Navigate } from "react-router-dom";

import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuthStore } from "@/stores/auth-store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { PendingPage } from "@/features/auth/pages/PendingPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { IncidentArchivePage } from "@/features/dashboard/pages/IncidentArchivePage";
import { ValidateDetailPage } from "@/features/hitl/pages/ValidateDetailPage";
import { ValidatePage } from "@/features/hitl/pages/ValidatePage";
import { MapPage } from "@/features/map/pages/MapPage";
import { ModelAuditPage } from "@/features/audit/pages/ModelAuditPage";
import { AuditArchivePage } from "@/features/audit/pages/AuditArchivePage";
import { SettingsPage } from "@/features/admin/pages/SettingsPage";
import { PendingUsersTab } from "@/features/admin/pages/PendingUsersTab";
import { ApprovedUsersTab } from "@/features/admin/pages/ApprovedUsersTab";
import { RejectedUsersTab } from "@/features/admin/pages/RejectedUsersTab";
import { BarangayDirectoryTab } from "@/features/admin/pages/BarangayDirectoryTab";
import { HomePage } from "@/features/social/pages/HomePage";

function IndexRedirect() {
	const { profile } = useAuthStore();

	if (profile?.role === "barangay_official") {
		return <Navigate to="/home" replace />;
	}

	return <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
	{
		element: <PublicLayout />,
		children: [
			{ path: "/login", element: <LoginPage /> },
			{ path: "/register", element: <RegisterPage /> },
		],
	},
	{
		element: <PrivateLayout />,
		children: [
			{ index: true, element: <IndexRedirect /> },
			{ path: "/home", element: <HomePage /> },
			{ path: "/dashboard", element: <DashboardPage /> },
			{ path: "/validate", element: <ValidatePage /> },
			{ path: "/validate/:reportId", element: <ValidateDetailPage /> },
			{ path: "/map", element: <MapPage /> },
			{ path: "/audit", element: <ModelAuditPage /> },
			{ path: "/audit/archive", element: <AuditArchivePage /> },
			{ path: "/reports", element: <IncidentArchivePage /> },
			{ path: "/settings", element: <SettingsPage /> },
			{ path: "/settings/users", element: <PendingUsersTab /> },
			{ path: "/settings/approved", element: <ApprovedUsersTab /> },
			{ path: "/settings/rejected", element: <RejectedUsersTab /> },
			{ path: "/settings/directory", element: <BarangayDirectoryTab /> },
		],
	},
	{ path: "/account-pending", element: <PendingPage /> },
	{ path: "*", element: <Navigate to="/login" replace /> },
]);
