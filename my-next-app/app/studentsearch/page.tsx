'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

interface StudentProfile {
  id: number;
  created_at: string;
  assigned_id: number | null;
  name: string | null;
  grade: number | null;
  school: string | null;
  unweighted_acad_gpa: number | null;
  weighted_acad_gpa: number | null;
}

export default function SearchPage() {
  const [entries, setEntries] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [gpaFilter, setGpaFilter] = useState('');
  const [textFilter, setTextFilter] = useState('');

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
        `${SUPABASE_URL}/rest/v1/studentprofiles?select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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

  const filteredEntries = entries.filter(e => {
    const nameMatch =
      !nameFilter || e.name?.toLowerCase().includes(nameFilter.toLowerCase());
    const gpaMatch =
      !gpaFilter ||
      (e.weighted_acad_gpa && e.weighted_acad_gpa >= parseFloat(gpaFilter));

    let textMatch = true;
    if (textFilter) {
      const searchTerms = textFilter.split(',').map(t => t.trim().toLowerCase());
      const searchableText = [
        e.add_comm || '',
        e.advanced_courses || '',
        e.school || ''
      ].join(' ').toLowerCase();

      textMatch = searchTerms.every(term => searchableText.includes(term));
    }

    return nameMatch && gpaMatch && textMatch;
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100 dark:bg-blue-950 font-sans">
      <main className="w-full max-w-7xl py-12 px-6 bg-blue-200 dark:bg-blue-900">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-blue-900 dark:text-blue-100">
            Search Student Resumes
          </h1>
          <p className="mt-4 text-base text-blue-700 dark:text-blue-300">
            Browse student profiles and resumes.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <input
            type="text"
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-4 py-2 rounded border
                       bg-blue-50 dark:bg-blue-800
                       border-blue-300 dark:border-blue-700
                       text-blue-900 dark:text-blue-100
                       placeholder-blue-500 dark:placeholder-blue-400
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Min GPA"
            value={gpaFilter}
            onChange={(e) => setGpaFilter(e.target.value)}
            className="px-4 py-2 rounded border
                       bg-blue-50 dark:bg-blue-800
                       border-blue-300 dark:border-blue-700
                       text-blue-900 dark:text-blue-100
                       placeholder-blue-500 dark:placeholder-blue-400
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder='Search text (e.g., "software", "tutor")'
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            className="px-4 py-2 rounded border
                      bg-blue-50 dark:bg-blue-800
                      border-blue-300 dark:border-blue-700
                      text-blue-900 dark:text-blue-100
                      placeholder-blue-500 dark:placeholder-blue-400
                      focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-blue-600 dark:text-blue-400">
              Loading student profiles...
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-blue-700 dark:text-blue-300">
              Error: {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-blue-700 dark:text-blue-400">
              Showing {filteredEntries.length} of {entries.length} students
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredEntries.map((student) => (
                <Link
                  key={student.id}
                  href={`/student/${student.id}`}
                  className="aspect-square rounded-lg shadow-lg transition-all duration-300
                             p-6 flex flex-col justify-between cursor-pointer transform
                             bg-blue-300 hover:bg-blue-400
                             dark:bg-blue-800 dark:hover:bg-blue-700
                             border border-blue-400 dark:border-blue-700
                             hover:scale-105"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-blue-900 dark:text-blue-100 line-clamp-2">
                      {student.name || 'Unnamed Student'}
                    </h3>
                    <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                      {student.school && (
                        <p className="line-clamp-2">{student.school}</p>
                      )}
                      {student.grade && <p>Grade: {student.grade}</p>}
                      {student.weighted_acad_gpa && (
                        <p>GPA: {student.weighted_acad_gpa.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center text-blue-600 dark:text-blue-400 py-20">
                No student profiles found
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
