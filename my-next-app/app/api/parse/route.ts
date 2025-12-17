import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('pdf') as File | null;
    const studentId = data.get('studentId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    //file setup
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const pdfPath = path.join(tempDir, `upload_${Date.now()}.pdf`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(pdfPath, buffer);

    //run
    const scriptPath = path.join(process.cwd(), 'parse_transcript.py');

    await new Promise<void>((resolve, reject) => {
      const proc = spawn('python3', [scriptPath, pdfPath], { cwd: tempDir });

      let stderr = '';
      proc.stderr.on('data', (d) => (stderr += d.toString()));

      proc.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr || 'Python script failed'));
        else resolve();
      });
    });

    //csv parsing from the python script
    const csvPath = path.join(tempDir, 'student_data.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');

    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) throw new Error('No data parsed from PDF');

    const headers = lines[0].split(',');
    const values = lines[1]
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(v => v.replace(/^"|"$/g, '').trim());

    const parsedData: Record<string, string | null> = {};
    headers.forEach((h, i) => {
      parsedData[h.trim()] = values[i] || null;
    });

    let advanced_courses: {
      type: string;
      course_title: string;
      year: string;
    }[] = [];

    if (parsedData.advanced_courses) {
      advanced_courses = parsedData.advanced_courses
        .split(';')
        .map(c => {
          const match = c.trim().match(
            /^(AP|IB|H)\s*:\s*(.+?)\s*\(([^)]+)\)$/
          );
          return match
            ? { type: match[1], course_title: match[2], year: match[3] }
            : null;
        })
        .filter(Boolean) as any[];
    }

    const add_comm = (data.get('add_comm') as string | null) || parsedData.add_comm || null;

    let assigned_id: number;
    if (studentId) {
      assigned_id = parseInt(studentId, 10);
      if (isNaN(assigned_id)) throw new Error('Invalid student ID');
    } else {
      assigned_id = Math.floor(Math.random() * 900000) + 100000; //id random
    }

    const supabaseData = {
      assigned_id,
      name: parsedData.name,
      grade: parsedData.grade ? parseInt(parsedData.grade) : null,
      school: parsedData.school,
      unweighted_acad_gpa: parsedData.unweighted_acad_gpa
        ? parseFloat(parsedData.unweighted_acad_gpa)
        : null,
      weighted_acad_gpa: parsedData.weighted_acad_gpa
        ? parseFloat(parsedData.weighted_acad_gpa)
        : null,
      advanced_courses,
      num_advanced_courses: advanced_courses.length,
      add_comm
    };

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let existing: any[] = [];

    if (studentId) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/studentprofiles?assigned_id=eq.${assigned_id}&select=id`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      existing = await res.json();
    }

    let message: string;

    if (existing.length > 0) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/studentprofiles?id=eq.${existing[0].id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(supabaseData)
        }
      );
      if (!res.ok) throw new Error('Failed to update student');
      message = 'Student updated successfully';
    } else {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/studentprofiles`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify(supabaseData)
        }
      );
      if (!res.ok) throw new Error(await res.text());
      message = 'Student created successfully';
    }

    await Promise.allSettled([
      fs.unlink(pdfPath),
      fs.unlink(csvPath)
    ]);

    return NextResponse.json({
      message,
      student: supabaseData
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
