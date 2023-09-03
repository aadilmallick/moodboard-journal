import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { ResponseTypes } from "@/utils/fetcher";
import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();
  const userId = user!.id;

  const match = await prisma.user.findUnique({
    where: {
      clerkId: userId!,
    },
  });

  const entry = await prisma.journalEntry.create({
    data: {
      authorId: match!.id,
      content: "Write about your day",
    },
  });

  const analysis = await analyze(entry.content);
  await prisma.analysis.create({
    data: {
      entryId: entry.id,
      userId: match!.id,
      ...analysis,
    },
  });

  revalidatePath("/journal");
  return NextResponse.json({ entry } as ResponseTypes["/api/journal"]);
}
