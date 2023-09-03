import { prisma } from "@/utils/db";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import { redirect } from "next/navigation";

async function createNewUser() {
  // we will check if the user visiting this route is a new user or not
  // by checking whether we have them saved in our database. If yes, they are not new.
  // If no, they are new, and we can add them to our database.
  const user = await currentUser();
  const userId = user!.id;

  const match = await prisma.user.findUnique({
    where: {
      clerkId: userId!,
    },
  });

  if (!match) {
    await prisma.user.create({
      data: {
        clerkId: userId!,
      },
    });
  }
  return redirect("/journal");
}

const NewUser = async () => {
  await createNewUser();
  return <div>NewUser</div>;
};

export default NewUser;
