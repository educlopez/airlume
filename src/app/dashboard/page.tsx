"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Hello, {user.firstName || user.username || "User"}!
      </h1>
      <p className="mb-6">
        Welcome to your dashboard. Start building your first component:
      </p>
      <Link href="/builder">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Create Component
        </button>
      </Link>
    </div>
  );
}
