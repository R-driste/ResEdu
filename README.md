Formal Documentation:
* [SCMP](https://docs.google.com/document/d/1u1q1hgjIUURXIhnv7-LSbweoyxZzlKyhz7rjZbcVgz0/edit?usp=sharing)
* [SPMP](https://docs.google.com/document/d/1rks4yTm80OJ7OrrlYfoRAvIC97w2IZxC20SXba120Yo/edit?usp=sharing)
* [SVVP](https://docs.google.com/document/d/1DRvEikGXf2sf3GynRwIbduW03o8bnIZQs42ZujRNvBo/edit?usp=sharing)
* [SQAP](https://docs.google.com/document/d/1oBugxL6x1FHI3xd-f8N5EgJrSAEsB72COqTDBQuHiTs/edit?usp=sharing)
* [SRS](https://docs.google.com/document/d/11Q5t4RQi8-misSbDrujCSyKjLTVAVgpNEEgPOfIWwMA/edit?usp=sharing)
* [SDD](https://docs.google.com/document/d/1nPcpGrLFURXnwq8SgUC_Qm74se8sB19bOwMUkOyW6As/edit?usp=sharing)

Setup Instructions:

### Prerequisites
- Node.js (version 18 or higher)
- A Supabase account

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/R-driste/EduRes.git
   cd EduRes/my-next-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Supabase Setup [IGNORE, ONLY FOLLOW IF YOU ARE CREATING YOUR OWN DUPLICATE]
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to Settings > API and copy the Project URL and anon public key.
3. In the Table Editor, create a table named `STUDENTPROFILES` with the following columns:
   - `id` (int8, primary key, auto-increment)
   - `created_at` (timestamptz, default now())
   - `name` (text, nullable)
   - `'files guide'` (text, nullable)  # Note: quoted for special characters
   - `grade` (int4, nullable)
   - `school` (text, nullable)
   - `zip` (int4, nullable)
4. Disable Row Level Security (RLS) on the table for public access.
5. Import data from `../student_data.csv`:
   - In Table Editor > STUDENTPROFILES > Import
   - Upload the CSV, map columns (e.g., CSV `name` to `name`, `grade` to `grade`), set others to null.

### Environment Variables
Create a `.env.local` file in `my-next-app/`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
```

### Running the App
```
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
