import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Note: needs service role key for admin access
)

async function migrateFiles() {
  console.log('Starting file migration...')
  
  try {
    // 1. Get all records from medical_files table
    const { data: medicalFiles, error: dbError } = await supabase
      .from('medical_files')
      .select('*')
    
    if (dbError) throw dbError
    if (!medicalFiles?.length) {
      console.log('No medical files to migrate')
      return
    }

    console.log(`Found ${medicalFiles.length} files to migrate`)

    // 2. Process each file
    for (const file of medicalFiles) {
      try {
        console.log(`Processing file: ${file.file_name}`)

        // Download file from medical-files bucket
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('medical-files')
          .download(file.file_url)

        if (downloadError) throw downloadError
        if (!fileData) {
          console.log(`No data found for file: ${file.file_name}`)
          continue
        }

        // Create new path in documents bucket
        const newPath = `${file.user_id}/${file.patient_id}/${Date.now()}-${file.file_name}`
        
        // Upload to documents bucket
        const { error: uploadError } = await supabase
          .storage
          .from('documents')
          .upload(newPath, fileData)

        if (uploadError) throw uploadError

        // Get the new public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('documents')
          .getPublicUrl(newPath)

        // Insert into documents table
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            patient_id: file.patient_id,
            user_id: file.user_id,
            name: file.file_name,
            type: file.file_type || 'application/octet-stream',
            size: fileData.size,
            url: newPath,
            category: 'other',
            uploaded_at: file.upload_date || new Date().toISOString()
          })

        if (insertError) throw insertError

        console.log(`Successfully migrated: ${file.file_name}`)
        
        // Optional: Delete from original bucket
        // Commented out for safety - uncomment after verifying migration
        /* const { error: deleteError } = await supabase
          .storage
          .from('medical-files')
          .remove([file.file_url])

        if (deleteError) throw deleteError */

      } catch (error) {
        console.error(`Error processing file ${file.file_name}:`, error)
        // Continue with next file
        continue
      }
    }

    console.log('Migration completed!')

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run the migration
migrateFiles() 