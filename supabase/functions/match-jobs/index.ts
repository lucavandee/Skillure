import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { encode } from 'npm:gpt-3-encoder@1.1.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002'
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('job_id');

    if (!jobId) {
      throw new Error('job_id parameter is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get job details and embedding
    const { data: job } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        job_embeddings (
          embedding
        )
      `)
      .eq('id', jobId)
      .single();

    if (!job || !job.job_embeddings?.[0]?.embedding) {
      throw new Error('Job or embedding not found');
    }

    const jobEmbedding = job.job_embeddings[0].embedding;

    // Find similar jobs using vector similarity
    const { data: similarJobs } = await supabaseClient.rpc('match_jobs', {
      query_embedding: jobEmbedding,
      match_threshold: 0.7,
      match_count: 10
    });

    return new Response(
      JSON.stringify({ 
        job,
        similar_jobs: similarJobs
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});