import Editor, { EditorProps } from "@/components/journal/Editor";
import { prisma } from "@/utils/db";
import { currentUser } from "@clerk/nextjs";
import { JournalEntry } from "@prisma/client";
import React from "react";

interface Props {
  params: {
    id: string;
  };
}

async function getEntry(id: string) {
  const user = await currentUser();
  const userId = user!.id;

  // get user by clerk id
  const curUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  const match = await prisma.journalEntry.findUnique({
    where: {
      id,
      authorId: curUser!.id,
    },
    include: {
      analysis: true,
    },
  });

  // console.log(match);

  if (!match) throw new Error("Entry not found");

  return match;
}

const page = async ({ params: { id } }: Props) => {
  const entry = await getEntry(id);

  const analysisArray = [];
  return (
    <>
      <Editor journalEntry={entry as JournalEntry} />
    </>
  );
};

export default page;
