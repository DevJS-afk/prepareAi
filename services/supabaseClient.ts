import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials to initialize the client.
const supabaseUrl = 'https://hpzbedqaixuggwiaxucr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwemJlZHFhaXh1Z2d3aWF4dWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgyNzgsImV4cCI6MjA3ODA0NDI3OH0.qNpkPAs39_dg3dTFRfodJxGKUFnQaqa3sbCIXa98qMo';

if (!supabaseUrl || !supabaseKey) {
  // This warning is now unlikely to be hit, but kept for safety.
  console.warn("Supabase credentials are not set. Data will not be saved.");
}

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
