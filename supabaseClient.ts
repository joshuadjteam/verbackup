
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnnpxifvsrlzfpaisdhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubnB4aWZ2c3JsemZwYWlzZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTg5MTgsImV4cCI6MjA3ODEzNDkxOH0.YgFEKp7ifE-9TLzplVDlvKU-5q3GA5hFu0zQ5pI_8kQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable session persistence to handle token refreshes automatically.
    // This prevents the user from being logged out or losing services after the initial token expiry (usually 1h, sometimes less).
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
