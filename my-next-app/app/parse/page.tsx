'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ParsePage() {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addComm, setAddComm] = useState('');
  const [parsedData, setParsedData] = useState<{
    student: any;
    courses: any[];
    advanced_courses?: string;
    add_comm?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setParsedData(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setParsedData(null);

    const formData = new FormData();
    formData.append('pdf', file);
    if (studentId) formData.append('studentId', studentId);
    if (addComm) formData.append('add_comm', addComm); // send to API

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        if (data.student) {
          setParsedData({
            student: data.student,
            courses: data.courses || [],
            advanced_courses: data.advanced_courses || '',
            add_comm: data.add_comm || addComm
          });
          setAddComm(data.add_comm || addComm);
        }
      } else {
        setError(data.error || 'Failed to parse and save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-700 font-sans dark:bg-slate-900">
      <main className="w-full max-w-7xl py-12 px-6 bg-slate-800 dark:bg-slate-950">
        <h1 className="text-4xl font-semibold text-slate-50 dark:text-zinc-50">
          Parse Transcript PDF
        </h1>
        <p className="text-base text-zinc-700 dark:text-zinc-400 mb-6">
          Upload a PDF transcript to convert it to CSV format.
        </p>

        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
          />
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Optional: Existing Student ID to update"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-md px-4 py-3 bg-blue-50 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 placeholder-blue-500 dark:placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <textarea
            rows={5}
            value={addComm}
            onChange={(e) => setAddComm(e.target.value)}
            placeholder="Optional: courses, activities, projects, or work interests…"
            className="w-full rounded-md px-4 py-3 bg-blue-50 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 placeholder-blue-500 dark:placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleParse}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-800">
            <p className="text-green-600 dark:text-green-400">{message}</p>
          </div>
        )}

        {parsedData && (
          <div className="mt-8 space-y-6">
            <div className="border rounded-lg p-6 dark:border-zinc-700">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                Student Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {parsedData.student.name && (
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-400">Name:</span>
                    <p className="text-black dark:text-zinc-200">{parsedData.student.name}</p>
                  </div>
                )}
                {parsedData.student.student_id && (
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-400">Student ID:</span>
                    <p className="text-black dark:text-zinc-200">{parsedData.student.student_id}</p>
                  </div>
                )}
                {parsedData.student.grade && (
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-400">Grade:</span>
                    <p className="text-black dark:text-zinc-200">{parsedData.student.grade}</p>
                  </div>
                )}
                {parsedData.student.weighted_acad_gpa && (
                  <div>
                    <span className="font-medium text-zinc-700 dark:text-zinc-400">Weighted GPA:</span>
                    <p className="text-black dark:text-zinc-200">{parsedData.student.weighted_acad_gpa}</p>
                  </div>
                )}
              </div>
            </div>

            {parsedData.advanced_courses && (
              <div className="border rounded-lg p-6 dark:border-zinc-700">
                <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-2">
                  Advanced Courses
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                  {parsedData.advanced_courses}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
