import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
let supabase: any;

if (typeof window !== 'undefined') {
  // Use a singleton pattern on the client side to prevent multiple GoTrueClient instances
  if (!(window as any).supabaseClient) {
    (window as any).supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  supabase = (window as any).supabaseClient;
} else {
  // Always create a new client on the server
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { supabase };
