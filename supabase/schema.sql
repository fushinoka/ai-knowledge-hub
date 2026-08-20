-- AI Knowledge Hub — database schema
-- Run this in the Supabase SQL editor after creating a new project.

create extension if not exists vector;

-- Roles a user can have on a document
create type document_role as enum ('owner', 'editor', 'viewer');

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade not null,
  title text not null,
  content text not null,
  summary text,
  file_path text,
  embedding vector(1536),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists document_access (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents (id) on delete cascade not null,
  user_id uuid references auth.users (id) on delete cascade not null,
  role document_role default 'viewer' not null,
  created_at timestamptz default now() not null,
  unique (document_id, user_id)
);

-- Speed up semantic search
create index if not exists documents_embedding_idx
  on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists document_access_user_idx
  on document_access (user_id);

-- Row Level Security
alter table documents enable row level security;
alter table document_access enable row level security;

create policy "Owners can do everything with their documents"
  on documents for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can read documents shared with them"
  on documents for select
  using (
    exists (
      select 1 from document_access
      where document_access.document_id = documents.id
      and document_access.user_id = auth.uid()
    )
  );

create policy "Editors can update shared documents"
  on documents for update
  using (
    exists (
      select 1 from document_access
      where document_access.document_id = documents.id
      and document_access.user_id = auth.uid()
      and document_access.role = 'editor'
    )
  );

create policy "Users can see their own access rows"
  on document_access for select
  using (user_id = auth.uid());

-- Semantic search RPC: cosine similarity against the query embedding,
-- scoped to documents the calling user owns or has been granted access to.
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float default 0.75,
  match_count int default 10
)
returns table (
  id uuid,
  title text,
  summary text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.title,
    documents.summary,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where
    (
      documents.owner_id = auth.uid()
      or exists (
        select 1 from document_access
        where document_access.document_id = documents.id
        and document_access.user_id = auth.uid()
      )
    )
    and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_set_updated_at
  before update on documents
  for each row
  execute procedure set_updated_at();
