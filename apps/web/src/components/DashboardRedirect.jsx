"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, homePathForRole, isAuthenticated } from "../utils/caseStore.js";

function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? homePathForRole(getCurrentUser()?.role) : "/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default DashboardRedirect;
