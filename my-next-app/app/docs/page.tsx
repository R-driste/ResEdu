import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl py-32 px-6 bg-white dark:bg-black">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">Documentation</h1>
        <p className="mt-4 text-base text-zinc-700 dark:text-zinc-400">
          This is the internal Documentation page. Replace with your docs, links, or guides.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
