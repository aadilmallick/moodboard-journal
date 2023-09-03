import HistoryChart from "@/components/journal/HistoryChart";
import { prisma } from "@/utils/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";

async function getData() {
  const user = await currentUser();
  const userId = user!.id;

  const match = await prisma.user.findUnique({
    where: {
      clerkId: userId!,
    },
  });

  const analyses = await prisma.analysis.findMany({
    where: {
      userId: match!.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const avgScore =
    analyses.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0) /
    analyses.length;

  return {
    analyses,

    avgScore,
  };
}

const page = async () => {
  const { analyses, avgScore } = await getData();
  return (
    <div>
      <p>Avergae score : {avgScore}</p>
      <div className="h-96">
        <HistoryChart data={analyses} />
      </div>
    </div>
  );
};

export default page;
