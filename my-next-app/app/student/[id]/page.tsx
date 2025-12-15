import Link from "next/link";
import { notFound } from "next/navigation";

interface StudentProfile {
  id: number;
  created_at: string;
  name: string | null;
  'files guide': string | null;
  grade: number | null;
  school: string | null;
  zip: number | null;
}

async function getStudent(id: string): Promise<StudentProfile | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/STUDENTPROFILES?id=eq.${id}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data[0] || null;
}

export default async function StudentPage({ params }: { params: { id: string } }) {
  const student = await getStudent(params.id);

  if (!student) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-4xl py-32 px-6 bg-white dark:bg-black">
        <div className="mb-8">
          <Link href="/studentsearch" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to student search
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold mb-6 text-black dark:text-zinc-50">
            {student.name || 'Unnamed Student'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Basic Information</h3>
                <div className="mt-2 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <p><strong>ID:</strong> {student.id}</p>
                  <p><strong>Name:</strong> {student.name || 'N/A'}</p>
                  <p><strong>Grade:</strong> {student.grade || 'N/A'}</p>
                  <p><strong>School:</strong> {student.school || 'N/A'}</p>
                  <p><strong>ZIP Code:</strong> {student.zip || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Files Guide</h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  {student['files guide'] || 'No files guide available'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Additional Details</h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  Created: {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Add more fields if available */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}