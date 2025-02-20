"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a unique ID for this guest session
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const res = await signIn("credentials", {
      email: `${guestId}@guest.com`,
      password: "guest-password",
      isGuest: true, // Add this to your credentials auth config
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    }
  };

  // If user is already logged in, show welcome message
  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Welcome, {session.user?.email}!</p>
        <button
          onClick={() => signOut()}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex w-80 flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border bg-secondary p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border bg-secondary p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <button
          type="submit"
          className="mt-2 rounded bg-primary py-2 text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </button>
      </form>
      <form onSubmit={handleGuestLogin}>
        <button
          type="submit"
          className="bg-guest/90 hover:bg-guest/80 mt-2 w-80 rounded py-2 text-secondary-foreground"
        >
          Sign In as Guest
        </button>
      </form>
    </div>
  );
}
