"use client";

import { signOut } from "next-auth/react";
export default function Feed() {
  return (
    <>
      <div>Feed</div>
      <div>
        <button
          onClick={() => signOut({ callbackUrl: "/signin",})} className="px-4 py-2 bg-red-900 text-black rounded"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
