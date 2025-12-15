import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('pdf') as File;
    const studentId = data.get('studentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    //temp file save
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const pdfPath = path.join(tempDir, `upload_${Date.now()}.pdf`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(pdfPath, buffer);

    //this python script parses the pdf and outputs a csv
    const scriptPath = path.join(process.cwd(), 'parse_transcript.py');
    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(`python3 ${scriptPath} "${pdfPath}"`, { cwd: tempDir, timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Script failed: ${stderr || error.message}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    console.log('Script stdout:', stdout);
    console.log('Script stderr:', stderr);

    //we extract the pdf details
    const csvPath = path.join(tempDir, 'student_data.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('No data parsed from PDF');
    }
    const headers = lines[0].split(',');
    const values = lines[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
    const parsedData: any = {};
    headers.forEach((h, i) => {
      parsedData[h.trim()] = values[i]?.trim() || null;
    });

    //student id assignment
    if (studentId) {
      parsedData.student_id = studentId;
    }

    //generate id
    let assigned_id;
    if (studentId) {
      assigned_id = parseInt(studentId);
      if (isNaN(assigned_id)) {
        throw new Error('Invalid student ID provided');
      }
    } else {
      assigned_id = Math.floor(Math.random() * 900000) + 100000; // Random 6-digit number
    }

    //supabase formatting
    const supabaseData = {
      assigned_id: assigned_id,
      name: parsedData.name,
      grade: parsedData.grade ? parseInt(parsedData.grade) : null,
      school: parsedData.school || null,
      unweighted_acad_gpa: parsedData.unweighted_acad_gpa ? parseFloat(parsedData.unweighted_acad_gpa) : null,
      weighted_acad_gpa: parsedData.weighted_acad_gpa ? parseFloat(parsedData.weighted_acad_gpa) : null,
    };

    console.log('Supabase data:', supabaseData);

    //if assigned_id exists (only if provided)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let existing = [];
    if (studentId) {
      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/studentprofiles?assigned_id=eq.${assigned_id}&select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check existing student');
      }

      existing = await checkResponse.json();
      if (existing.length === 0) {
        throw new Error('Student ID not found');
      }
    }

    let result;
    if (existing.length > 0) {
      // Update
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/studentprofiles?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supabaseData),
      });
      if (!updateResponse.ok) {
        throw new Error('Failed to update student');
      }
      result = 'Student updated successfully';
    } else {
      // Insert
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/studentprofiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supabaseData),
      });
      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Insert failed:', insertResponse.status, errorText);
        throw new Error(`Failed to create student: ${errorText}`);
      }
      result = 'Student created successfully';
    }

    // Clean up
    await fs.unlink(pdfPath);
    await fs.unlink(csvPath).catch(() => {});

    return NextResponse.json({ message: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to parse and save' }, { status: 500 });
  }
}