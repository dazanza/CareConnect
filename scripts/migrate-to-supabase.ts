import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateUsers() {
  try {
    // Get all existing users without supabase_id
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .is('supabase_id', null)

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return
    }
    
    console.log(`Found ${existingUsers?.length} users to migrate`)

    // 3. Migrate each user
    for (const user of existingUsers || []) {
      try {
        console.log(`Starting migration for user: ${user.email}`)

        // Check if user already exists in Supabase auth
        const { data: existingAuth } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', user.email)
          .single()

        let authUser
        if (existingAuth) {
          console.log(`User ${user.email} already exists in Supabase auth, linking...`)
          authUser = existingAuth
        } else {
          // Create Supabase auth user with a temporary password
          const tempPassword = Math.random().toString(36).slice(-12)
          const { data, error: createError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            password: tempPassword,
            user_metadata: {
              first_name: user.first_name,
              last_name: user.last_name,
              migrated_from_clerk: true
            }
          })

          if (createError) {
            console.error(`Error creating auth user ${user.email}:`, createError)
            continue
          }
          authUser = data.user
        }

        // Update user record with Supabase ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            supabase_id: authUser.id,
            old_clerk_id: user.clerk_id 
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError)
          continue
        }

        // Send password reset email to user
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: user.email
        })

        if (resetError) {
          console.warn(`Failed to send reset email to ${user.email}:`, resetError)
        }

        console.log(`Successfully migrated user: ${user.email}`)
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error)
      }
    }

    console.log('Migration completed')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateUsers() 