import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateUsers() {
  try {
    // Get all users that need to be migrated (those without a supabase_id)
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, clerk_id')
      .is('supabase_id', null);

    if (fetchError) throw fetchError;
    if (!users?.length) {
      console.log('No users to migrate');
      return;
    }

    console.log(`Found ${users.length} users to migrate`);

    // Process each user
    for (const user of users) {
      try {
        // Create Supabase auth user
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          password: `temp-${Math.random().toString(36).slice(2)}`, // Random temporary password
          user_metadata: {
            old_clerk_id: user.clerk_id
          }
        });

        if (createError) throw createError;

        // Update user record with Supabase ID
        const { error: updateError } = await supabase
          .from('users')
          .update({
            supabase_id: authUser.user.id,
            old_clerk_id: user.clerk_id
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Send password reset email
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: user.email
        });

        if (resetError) throw resetError;

        console.log(`✓ Migrated user ${user.email}`);
      } catch (error) {
        console.error(`× Failed to migrate user ${user.email}:`, error);
      }
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateUsers(); 