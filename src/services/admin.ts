import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
// Note: In production, service role key should be stored securely on the server
// For demo purposes only, we'll use a placeholder
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || '';

console.log('=== Admin Service Debug ===');
console.log('Service Role Key available:', supabaseServiceRoleKey ? 'YES' : 'NO');

// Create admin client with service role (bypasses RLS)
export const adminSupabase = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

console.log('Admin Supabase client created:', adminSupabase ? 'YES' : 'NO');

// Admin functions that bypass RLS
export const adminOperations = {
  async createItem(itemData: any) {
    if (!adminSupabase) {
      console.log('No admin client available, using regular client');
      // Fallback to regular client
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('items').insert([itemData]);
    }

    console.log('Using admin client to create item');
    return adminSupabase.from('items').insert([itemData]);
  },

  async updateItem(id: string, itemData: any) {
    if (!adminSupabase) {
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('items').update(itemData).eq('id', id);
    }

    return adminSupabase.from('items').update(itemData).eq('id', id);
  },

  async deleteItem(id: string) {
    if (!adminSupabase) {
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('items').delete().eq('id', id);
    }

    return adminSupabase.from('items').delete().eq('id', id);
  },

  async createCategory(categoryData: any) {
    if (!adminSupabase) {
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('categories').insert([categoryData]);
    }

    return adminSupabase.from('categories').insert([categoryData]);
  },

  async updateCategory(id: string, categoryData: any) {
    if (!adminSupabase) {
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('categories').update(categoryData).eq('id', id);
    }

    return adminSupabase.from('categories').update(categoryData).eq('id', id);
  },

  async deleteCategory(id: string) {
    if (!adminSupabase) {
      const { createClient } = await import('@supabase/supabase-js');
      const regularClient = createClient(supabaseUrl, process.env.REACT_APP_SUPABASE_ANON_KEY || '');
      return regularClient.from('categories').delete().eq('id', id);
    }

    return adminSupabase.from('categories').delete().eq('id', id);
  }
};