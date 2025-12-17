import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-slate-900">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-blue-500 dark:bg-slate-900 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-full text-5xl sm:text-6xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            ResEDU
          </h1>
          <p className="max-w-md text-sm sm:text-base font-normal leading-7 text-zinc-700 dark:text-zinc-400">
            We are a web-based platform where high school students can share their academic achievements, research, and extracurricular activities accumulated throughout their high school years in one organized place. The goal is to make it easier for students to present their accomplishments to network and gain more opportunities while allowing colleges to view student profiles in a more accessible way.
          </p>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="/studentsearch"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Search Now
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-slate-900/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="/docs"
          >
            Documentation
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-slate-900/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="/parse"
          >
            Parse PDF
          </Link>
          
        </div>
      </main>
    </div>
  );
}
