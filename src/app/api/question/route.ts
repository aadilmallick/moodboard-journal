import { qa } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { RequestBodyTypes, ResponseTypes } from "@/utils/fetcher";
import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const user = await currentUser();
  const userId = user!.id;

  const { question }: RequestBodyTypes["/api/question"] = await request.json();

  const curUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  // using the select key is good for performance since we only get back the properties we need.
  const entries = await prisma.journalEntry.findMany({
    where: {
      authorId: curUser!.id,
    },
    select: {
      content: true,
      createdAt: true,
      id: true,
    },
  });

  const answer = await qa(entries, question);
  return NextResponse.json({
    answer,
  } as ResponseTypes["/api/question"]);
};
