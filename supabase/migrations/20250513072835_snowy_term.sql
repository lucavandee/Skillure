/*
  # Create jobs and embeddings tables

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `rate_min` (integer)
      - `rate_max` (integer)
      - `currency` (text)
      - `remote` (boolean)
      - `platform` (text)
      - `platform_url` (text)
      - `skills` (text[])
      - `duration` (text)
      - `status` (text)
      - `scraped_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `job_embeddings`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key)
      - `embedding` (vector(1536))
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for service role to write data
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text,
  rate_min integer,
  rate_max integer,
  currency text DEFAULT 'EUR',
  remote boolean DEFAULT false,
  platform text NOT NULL,
  platform_url text NOT NULL,
  skills text[] DEFAULT '{}',
  duration text,
  status text DEFAULT 'raw' CHECK (status IN ('raw', 'processed', 'error')),
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create job_embeddings table
CREATE TABLE IF NOT EXISTS job_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
CREATE POLICY "Allow authenticated users to read jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert jobs"
  ON jobs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update jobs"
  ON jobs
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for job_embeddings table
CREATE POLICY "Allow authenticated users to read job embeddings"
  ON job_embeddings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage job embeddings"
  ON job_embeddings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scraped_at ON jobs(scraped_at);
CREATE INDEX IF NOT EXISTS idx_job_embeddings_job_id ON job_embeddings(job_id);