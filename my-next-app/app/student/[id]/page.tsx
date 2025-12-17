import Link from "next/link";
import { notFound } from "next/navigation";

//all student attributes needed
interface StudentProfile {
  id: number;
  created_at: string;
  name: string | null;
  grade: number | null;
  school: string | null;
  advanced_courses: string | null;
  add_comm: string | null;
}

//grab student data from supabase
async function getStudent(id: string): Promise<StudentProfile | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/studentprofiles?id=eq.${id}&select=*`,
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

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-slate-900">
      <main className="w-full max-w-4xl py-32 px-6 bg-blue-500 dark:bg-slate-900">
        <div className="mb-8">
          <Link href="/studentsearch" className="text-sm font-medium text-blue-600 hover:underline">
            Back to student search
          </Link>
        </div>

        <div className="bg-blue-500 dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
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
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Additional Details</h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  Created: {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
     
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Advanced Courses
              </h3>
              {student.advanced_courses ? (
                <ul className="mt-2 text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                  {JSON.parse(student.advanced_courses).map(
                    (course: { type: string; course_title: string; year: string }, index: number) => (
                      <li key={index}>
                        {course.type}: {course.course_title} ({course.year})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  No advanced courses listed.
                </p>
              )}
            </div>


            <div className="mt-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Additional Comments
              </h3>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {student.add_comm || 'No additional comments provided.'}
              </p>
            </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}