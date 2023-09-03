import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { RequestBodyTypes, ResponseTypes } from "@/utils/fetcher";
import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export type WithAnalysis = {
  analysis: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    mood: string;
    summary: string;
    color: string;
    negative: boolean;
    entryId: string;
  } | null;
} & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  authorId: string;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await currentUser();
  const userId = user!.id;

  const { content }: RequestBodyTypes["/api/journal/[id]"] = await req.json();
  // console.log("content", content);
  revalidatePath("/journal");
  // get user by clerk id
  const curUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });
  const analysis = await analyze(content);
  const updatedEntry = await prisma.journalEntry.update({
    where: {
      id: params.id,
      authorId: curUser!.id,
    },
    data: {
      content,
      analysis: {
        upsert: {
          where: {
            entryId: params.id,
          },
          create: {
            ...analysis,
            userId: curUser!.id,
          },
          update: {
            ...analysis,
          },
        },
      },
    },
    include: {
      analysis: true,
    },
  });

  return NextResponse.json({
    entry: updatedEntry,
  } as ResponseTypes["/api/journal/[id]"]);
}
