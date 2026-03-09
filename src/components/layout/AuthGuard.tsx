"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { JiraProvider } from "@/context/JiraContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
    if (isAuthenticated && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  // Login page - render without dashboard layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render full dashboard layout
  return (
    <JiraProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-64 flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </JiraProvider>
  );
}
