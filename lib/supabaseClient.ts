import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase
// Helper to safely get env vars or return fallback
const getEnvVar = (key: string, fallback: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore if process is undefined
  }
  return fallback;
};

// Use environment variables if available, otherwise use these values
const SUPABASE_URL = getEnvVar('REACT_APP_SUPABASE_URL', 'https://qnosuixxovhmmraytkrs.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'sb_publishable_dRrSiXFJx-uCLgnFRnSfNg_Raw8WBWa');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials are missing or empty.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);