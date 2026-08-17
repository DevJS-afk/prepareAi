import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikcmgqwnxkecexmzhqmn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YVMbs0vRw_Vj7fM7G3Ww5Q_NZsiQ7ys';

export const supabase = createClient(supabaseUrl, supabaseKey);
