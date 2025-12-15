import re
import csv
from pathlib import Path

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file."""
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
        return text
    except ImportError:
        print("\nError: PyPDF2 not installed. Install it with:")
        print("  pip install PyPDF2")
        raise
    except Exception as e:
        print(f"Error reading PDF: {e}")
        raise

def parse_transcript(text):
    """Parse transcript text and extract student information and courses."""
    
    # Extract student info
    student_data = {}
    
    # Basic info patterns
    patterns = {
        'student_id': r'Student ID\s+(\d+)',
        'state_id': r'State Student ID\s+(\d+)',
        'grade': r'Grade\s+(\d+)',
        'age': r'Age\s+(\d+)',
        'birthdate': r'Birthdate\s+([\d/]+)',
        'counselor': r'Counselor\s+(.+)',
        'language': r'RptgLng\s+(\w+)',
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        student_data[key] = match.group(1).strip() if match else ''
    
    # Extract name (appears in header)
    name_match = re.search(r'Full Contact List For (.+)', text)
    if name_match:
        # Format is "Roy, Dristi" - reverse it
        name_parts = name_match.group(1).strip().split(', ')
        if len(name_parts) == 2:
            student_data['name'] = f"{name_parts[1]} {name_parts[0]}"
        else:
            student_data['name'] = name_match.group(1).strip()
    
    # Extract GPAs - improved pattern
    gpa_lines = re.findall(r'(\d+\.\d+)\s+(\d+\.\d+)', text)
    if len(gpa_lines) >= 3:
        student_data['weighted_acad_gpa'] = gpa_lines[0][0]
        student_data['unweighted_acad_gpa'] = gpa_lines[0][1]
        student_data['weighted_total_gpa'] = gpa_lines[1][0]
        student_data['unweighted_total_gpa'] = gpa_lines[1][1]
        student_data['weighted_10_12_gpa'] = gpa_lines[2][0]
        student_data['unweighted_10_12_gpa'] = gpa_lines[2][1]
    
    # Extract credits
    credit_pattern = r'(\d+\.\d+)\s+(\d+\.\d+)\s*$'
    credit_matches = re.findall(credit_pattern, text, re.MULTILINE)
    if credit_matches:
        # Last match should be total credits
        student_data['credits_attempted'] = credit_matches[-1][0]
        student_data['credits_completed'] = credit_matches[-1][1]
    
    return student_data

def parse_courses(text):
    """Parse course history from transcript."""
    courses = []
    
    # Find all course entries - improved pattern for the messy format
    # Look for lines with: school_year term grade course_id course_title grade_mark credits
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        # Look for year pattern at start
        year_match = re.match(r'^(\d+)\s+(\d{4}-\d{4})\s+(\d)\s+(\d+)\s+(\d+)', line)
        if year_match:
            school_code = year_match.group(1)
            year = year_match.group(2)
            term = year_match.group(3)
            grade = year_match.group(4)
            course_id = year_match.group(5)
            
            # Extract rest of line
            rest = line[year_match.end():].strip()
            
            # Try to extract course title, mark, and credits
            # Pattern: course_title P (optional H/AP) mark credits credits
            parts = rest.split()
            
            if len(parts) >= 3:
                # Last two should be credits
                credits_completed = parts[-1]
                credits_attempted = parts[-2]
                
                # Mark is before credits (could be A, A+, A-, etc.)
                mark = parts[-3] if len(parts) >= 3 else ''
                
                # Everything before mark is the course title
                title_parts = parts[:-3]
                # Remove 'P' and 'H/AP' indicators
                title_parts = [p for p in title_parts if p not in ['P', 'H/AP', 'N']]
                course_title = ' '.join(title_parts)
                
                courses.append({
                    'school_code': school_code,
                    'year': year,
                    'term': term,
                    'grade': grade,
                    'course_id': course_id,
                    'course_title': course_title,
                    'mark': mark,
                    'credits_attempted': credits_attempted,
                    'credits_completed': credits_completed
                })
    
    return courses

def process_transcript_file(filepath):
    """Process a single transcript file."""
    # Check if it's a PDF
    if filepath.suffix.lower() == '.pdf':
        text = extract_text_from_pdf(filepath)
    else:
        # Plain text file
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    
    student_data = parse_transcript(text)
    courses = parse_courses(text)
    
    return student_data, courses

def save_student_data_csv(student_data_list, output_file='student_data.csv'):
    """Save student information to CSV."""
    if not student_data_list:
        print("No student data to save")
        return
    
    # Get all possible keys
    all_keys = set()
    for data in student_data_list:
        all_keys.update(data.keys())
    
    fieldnames = sorted(all_keys)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(student_data_list)
    
    print(f"Student data saved to {output_file}")

def save_courses_csv(courses_list, output_file='courses.csv'):
    """Save course history to CSV."""
    if not courses_list:
        print("No course data to save")
        return
    
    fieldnames = ['student_id', 'school_code', 'year', 'term', 'grade', 
                  'course_id', 'course_title', 'mark', 'credits_attempted', 'credits_completed']
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(courses_list)
    
    print(f"Course data saved to {output_file}")

def main():
    """Main function to process transcript files."""
    # Process single file or directory
    input_path = input("Enter transcript file or directory path: ").strip()
    
    path = Path(input_path)
    
    all_student_data = []
    all_courses = []
    
    if path.is_file():
        files = [path]
    elif path.is_dir():
        files = list(path.glob('*.pdf')) + list(path.glob('*.txt'))
    else:
        print(f"Invalid path: {input_path}")
        return
    
    for filepath in files:
        print(f"Processing {filepath.name}...")
        try:
            student_data, courses = process_transcript_file(filepath)
            
            # Add student ID to courses for reference
            student_id = student_data.get('student_id', '')
            for course in courses:
                course['student_id'] = student_id
            
            all_student_data.append(student_data)
            all_courses.extend(courses)
            
            print(f"  ✓ Extracted data for {student_data.get('name', 'Unknown')}")
            print(f"  ✓ Found {len(courses)} courses")
            
        except Exception as e:
            print(f"  ✗ Error processing {filepath.name}: {e}")
            import traceback
            traceback.print_exc()
    
    # Save to CSV files
    if all_student_data:
        save_student_data_csv(all_student_data)
    
    if all_courses:
        save_courses_csv(all_courses)
    
    print(f"\n{'='*50}")
    print(f"Processed {len(all_student_data)} transcript(s)")
    print(f"Extracted {len(all_courses)} course records")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()