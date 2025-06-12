import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { load } from 'npm:cheerio@1.0.0-rc.12';
import { encode } from 'npm:gpt-3-encoder@1.1.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Job {
  title: string;
  description: string;
  location: string;
  rate_min?: number;
  rate_max?: number;
  currency?: string;
  remote: boolean;
  platform: string;
  platform_url: string;
  skills: string[];
  duration?: string;
}

async function scrapeJellowJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://jellow.nl/freelance-opdrachten', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = await response.text();
    const $ = load(html);
    const jobs: Job[] = [];

    $('.job-card').each((_, element) => {
      const title = $(element).find('.job-title').text().trim();
      const description = $(element).find('.job-description').text().trim();
      const location = $(element).find('.job-location').text().trim();
      const rateText = $(element).find('.job-rate').text().trim();
      const skills = $(element).find('.job-skills').text().trim().split(',').map(s => s.trim());
      const duration = $(element).find('.job-duration').text().trim();
      const remote = $(element).find('.job-remote').length > 0;
      const url = $(element).find('.job-link').attr('href') || '';

      // Parse rate range
      const rateMatch = rateText.match(/€(\d+).*?(\d+)/);
      const rate_min = rateMatch ? parseInt(rateMatch[1]) : undefined;
      const rate_max = rateMatch ? parseInt(rateMatch[2]) : undefined;

      jobs.push({
        title,
        description,
        location,
        rate_min,
        rate_max,
        currency: 'EUR',
        remote,
        platform: 'Jellow',
        platform_url: url,
        skills,
        duration
      });
    });

    return jobs;
  } catch (error) {
    console.error('Error scraping Jellow:', error);
    return [];
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
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
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Scrape jobs
    const jobs = await scrapeJellowJobs();

    // Process each job
    for (const job of jobs) {
      // Check if job already exists
      const { data: existingJob } = await supabaseClient
        .from('jobs')
        .select('id')
        .eq('platform_url', job.platform_url)
        .single();

      if (existingJob) {
        continue; // Skip if job already exists
      }

      // Insert new job
      const { data: newJob, error: jobError } = await supabaseClient
        .from('jobs')
        .insert([{ ...job, status: 'raw' }])
        .select()
        .single();

      if (jobError) {
        console.error('Error inserting job:', jobError);
        continue;
      }

      // Generate and store embedding
      try {
        const combinedText = `${job.title} ${job.description}`;
        const embedding = await generateEmbedding(combinedText);

        const { error: embeddingError } = await supabaseClient
          .from('job_embeddings')
          .insert([{
            job_id: newJob.id,
            embedding
          }]);

        if (embeddingError) {
          console.error('Error inserting embedding:', embeddingError);
          continue;
        }

        // Update job status to processed
        await supabaseClient
          .from('jobs')
          .update({ status: 'processed' })
          .eq('id', newJob.id);

      } catch (error) {
        console.error('Error processing embedding:', error);
        await supabaseClient
          .from('jobs')
          .update({ status: 'error' })
          .eq('id', newJob.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: jobs.length }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
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