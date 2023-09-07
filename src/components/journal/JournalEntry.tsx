import { Analysis, JournalEntry, Prisma } from "@prisma/client";
import React from "react";
import Link from "next/link";

export interface JournalEntryProps {
  journalEntry: JournalEntry & {
    analysis?: Analysis;
  };
}

const JournalEntry = ({ journalEntry }: JournalEntryProps) => {
  const date = new Date(journalEntry.createdAt).toDateString();
  return (
    <Link
      className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow"
      href={`/journal/${journalEntry.id}`}
    >
      <div className="px-4 py-5 sm:p-6">
        Summary: {journalEntry.analysis?.summary}
      </div>
      <div className="px-4 py-4 sm:px-6">
        Mood: {journalEntry.analysis?.mood}
      </div>
      <div className="px-4 py-5 sm:px-6">{date}</div>
    </Link>
  );
};

export default JournalEntry;
