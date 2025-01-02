import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const getData = async (table:string ,column: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_URL}:${process.env.NEXT_PUBLIC_SMARTCAMPUSMAUA_SERVER_PORT}/api/auth/email`);
    const dataEmail = await response.json();

    const { data: userData } = await supabase.from(table).select(column).eq('email', dataEmail.displayName).single();

    return userData;
};

export { supabase,getData }

