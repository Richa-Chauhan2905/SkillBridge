"use client";

import { signOut } from "next-auth/react";
export default function Dashboard() {
  return (
    <>
      <div>Dashboard</div>
      <div>
        <button
          onClick={() => signOut()} className="px-4 py-2 bg-red-900 text-black rounded"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
