import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppPath } from "components";
import { Spin } from "antd";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./dashboard"));
const BrandProfile = lazy(() =>
  import("./brandProfile").then((m) => ({ default: m.BrandProfile }))
);
const UserProfile = lazy(() =>
  import("./userProfile").then((m) => ({ default: m.UserProfile }))
);
const Users = lazy(() =>
  import("./users").then((m) => ({ default: m.Users }))
);

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
      <Spin size="large" />
    </div>
  );
}

export default function PagesRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to={AppPath.home} replace />} />
        <Route path={AppPath.home} element={<Dashboard />} />
        <Route path={AppPath.brandProfile} element={<BrandProfile />} />
        <Route path={AppPath.userProfile} element={<UserProfile />} />
        <Route path={AppPath.users} element={<Users />} />
      </Routes>
    </Suspense>
  );
}
