'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ParsePage() {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('pdf', file);
    if (studentId) formData.append('studentId', studentId);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl py-32 px-6 bg-white dark:bg-black">
        <h1 className="text-4xl font-semibold text-black dark:text-zinc-50 mb-6">Parse Transcript PDF</h1>
        <p className="text-base text-zinc-700 dark:text-zinc-400 mb-6">
          Upload a PDF transcript to convert it to CSV format.
        </p>

        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Optional: Existing Student ID to update"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="px-4 py-2 border rounded w-full"
          />
        </div>

        <button
          onClick={handleParse}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>

        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}

        {message && (
          <p className="mt-4 text-green-600">{message}</p>
        )}

        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}