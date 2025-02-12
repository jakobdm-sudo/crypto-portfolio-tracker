"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard"); // Redirect to Dashboard if logged in
    } else if (status === "unauthenticated") {
      router.push("/login"); // Redirect to Login if not logged in
    }
  }, [session, status, router]);

  return <p>Loading...</p>; // Show loading state while redirecting
}
