"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProfileMenu from "@/components/ProfileMenu";
import { useAuth } from "@/lib/useAuth";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-foreground/50">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
        <ProfileMenu user={user} />
        {children}
      </main>
    </div>
  );
}
