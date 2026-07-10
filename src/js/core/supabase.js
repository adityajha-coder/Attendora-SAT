import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let supabaseUrl;
let supabaseAnonKey;

try {
    const response = await fetch('/api/config');
    if (response.ok) {
        const config = await response.json();
        supabaseUrl = config.supabaseUrl;
        supabaseAnonKey = config.supabaseAnonKey;
        if (!supabaseUrl || !supabaseAnonKey) throw new Error('Invalid config from API');
    } else {
        throw new Error('API bridge unavailable');
    }
} catch (e) {
    console.error('Failed to load Supabase config:', e);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
