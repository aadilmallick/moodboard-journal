import JournalEntry, {
  JournalEntryProps,
} from "@/components/journal/JournalEntry";
import NewEntry from "@/components/journal/NewEntry";
import QuestionForm from "@/components/journal/QuestionForm";
import { prisma } from "@/utils/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";

// Import a theme.css

async function fetchEntries() {
  // get user
  // get all entries belonging to user
  const user = await currentUser();
  const prismaUser = await prisma.user.findUnique({
    where: {
      clerkId: user!.id,
    },
  });
  const entries = await prisma.journalEntry.findMany({
    where: {
      authorId: prismaUser!.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      analysis: true,
    },
  });
  return entries;
}

const Journal = async () => {
  const entries = await fetchEntries();

  return (
    <>
      <QuestionForm />
      <div className="grid grid-cols-3 gap-4">
        <NewEntry />
        {entries.map((entry) => (
          <JournalEntry
            key={entry.id}
            journalEntry={entry as JournalEntryProps["journalEntry"]}
          />
        ))}
      </div>
    </>
  );
};

export default Journal;
