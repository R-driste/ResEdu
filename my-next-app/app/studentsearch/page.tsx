'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

interface StudentProfile {
  id: number;
  created_at: string;
  name: string | null;
  'files guide': string | null;
  grade: number | null;
  school: string | null;
  zip: number | null;
}

export default function SearchPage() {
  const [entries, setEntries] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Supabase credentials not configured');
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/STUDENTPROFILES?select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-7xl py-12 px-6 bg-white dark:bg-black">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-black dark:text-zinc-50">Search Student Resumes</h1>
          <p className="mt-4 text-base text-zinc-700 dark:text-zinc-400">
            Browse student profiles and resumes.
          </p>
          <div className="mt-6">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-zinc-600 dark:text-zinc-400">Loading student profiles...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-red-600">Error: {error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {entries.map((student) => (
                <div
                  key={student.id}
                  className="aspect-square bg-white dark:bg-zinc-900 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer hover:scale-105 transform border border-zinc-200 dark:border-zinc-800"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-black dark:text-zinc-50 line-clamp-2">
                      {student.name || 'Unnamed Student'}
                    </h3>
                    <div className="text-zinc-600 dark:text-zinc-400 text-sm space-y-1">
                      {student.school && (
                        <p className="line-clamp-2">{student.school}</p>
                      )}
                      {student.grade && (
                        <p>Grade: {student.grade}</p>
                      )}
                      {student.zip && (
                        <p>ZIP: {student.zip}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
                    ID: {student.id}
                  </div>
                </div>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-20">
                No student profiles found
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}