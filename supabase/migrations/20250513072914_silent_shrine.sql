/*
  # Create vector similarity matching function

  1. New Function
    - `match_jobs`: Finds similar jobs based on embedding similarity
    - Uses cosine similarity for matching
    - Returns jobs ordered by similarity score

  2. Parameters
    - `query_embedding`: vector to match against
    - `match_threshold`: minimum similarity score (0-1)
    - `match_count`: maximum number of matches to return
*/

CREATE OR REPLACE FUNCTION match_jobs (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    1 - (je.embedding <=> query_embedding) as similarity
  FROM jobs j
  JOIN job_embeddings je ON j.id = je.job_id
  WHERE 1 - (je.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;