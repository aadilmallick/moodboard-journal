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
      {/* <div className="col-span-2"> */}
      <Editor journalEntry={entry as JournalEntry} />
      {/* </div> */}
      {/* <div className="col-span-1">
      <h2>Analysis</h2>
      <div className="flex flex-col gap-2">
        <p className="border-b">Mood: {entry.analysis?.mood}</p>
        <p className="border-b flex items-center">
          Color:{" "}
          <span
            className="inline-block h-4 w-4 rounded-full ml-4"
            style={{
              backgroundColor: entry.analysis?.color,
            }}
          ></span>
        </p>
        <p className="border-b">
          Tone: {entry.analysis?.negative === true ? ":(" : ":)"}
        </p>
        <p className="border-b">Summary: {entry.analysis?.summary}</p>
      </div>
    </div> */}
    </>
  );
};

export default page;
