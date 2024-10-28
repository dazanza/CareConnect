-- Create storage bucket for documents
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false);

-- Create storage policy for reading documents
create policy "Users can read their own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    (auth.uid()::text = (storage.foldername(name))[1] or
    exists (
      select 1 from patient_shares ps
      join documents d on d.url = name
      where ps.patient_id = d.patient_id::integer
      and ps.shared_with_user_id = auth.uid()
      and ps.access_level in ('read', 'write', 'admin')
      and (ps.expires_at is null or ps.expires_at > now())
    ))
  );

-- Create storage policy for inserting documents
create policy "Users can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage policy for deleting documents
create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
