import { createClient } from '@supabase/supabase-js'

// פרטי Supabase של ההיכל
const supabaseUrl = 'https://taewbxptprdixsusvjfh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZXdieHB0cHJkaXhzdXN2amZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNDk0MjIsImV4cCI6MjA4NjgyNTQyMn0.TVgjzOt3UQW8FQVFk0Ze5Se2qOwS-WpqTSDHJlkIrFc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { supabaseUrl }