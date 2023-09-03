import { auth } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  return (
    <section className="h-screen grid place-items-center bg-slate-950">
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-7xl font-light capitalize text-white tracking-wide">
          Welcome to a journal app
        </h1>
        <p className="text-slate-300">The best journaling app there is</p>
        <Link
          href={userId ? "/journal" : "/new-user"}
          className="inline-block bg-blue-500 text-white px-4 py-1 rounded-md tracking-wide"
        >
          {userId ? "Go to Dashboard" : "Create an account"}
        </Link>
      </div>
    </section>
  );
}
