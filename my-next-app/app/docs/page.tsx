import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl py-32 px-6 bg-white dark:bg-black">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">Documentation</h1>
        <p className="mt-4 text-base text-zinc-700 dark:text-zinc-400">
          How to use the application: ResEdu is a student profile management platform that allows you to upload PDF transcripts for automatic data extraction and storage. Start by navigating to the Parse page and upload a student's transcript PDF, which will extract their personal information, academic performance, and course history to be uploaded to their profile. Once uploaded, use the Student Search page to find students by name or filter by GPA range. Click on any student card to view their detailed profile, including all extracted data and academic records. The application uses Supabase for secure data storage and provides a responsive interface for managing student information efficiently.
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
