"use client";
import { API, fetcher } from "@/utils/fetcher";
import { useRouter } from "next/navigation";
import React from "react";

const NewEntry = () => {
  const router = useRouter();
  return (
    <div>
      <button
        className="px-4 py-2 bg-black text-white rounded-md"
        onClick={async () => {
          const { entry } = await fetcher({
            url: API.JOURNAL,
            method: "POST",
          });
          router.refresh();
        }}
      >
        + New Entry
      </button>
    </div>
  );
};

export default NewEntry;
