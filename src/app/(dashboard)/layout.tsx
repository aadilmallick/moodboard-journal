import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="h-screen w-screen relative">
      <aside className="absolute top-0 left-0 h-full border-r border-black/25 p-4 w-64 flex flex-col space-y-2">
        <Link
          href={"/journal"}
          className="text-purple-400 uppercase tracking-wider"
        >
          Home
        </Link>
        <Link
          href={"/history"}
          className="text-purple-400 uppercase tracking-wider"
        >
          history
        </Link>
      </aside>
      <div className="ml-64">
        <header className="h-16 border-b border-black/25 flex justify-between items-center p-4">
          <div>Hello</div>
          <UserButton />
        </header>
        <div>{children}</div>
      </div>
    </section>
  );
}
