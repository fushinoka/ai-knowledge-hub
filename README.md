# AI Knowledge Hub

A knowledge base where you paste in documents and get an AI-generated summary
plus semantic search — searching by meaning instead of exact keywords.

Built because I kept losing track of notes and docs scattered across different
places, with no fast way to find what I actually needed.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** — Postgres database, auth, and row-level security
- **pgvector** — stores embeddings for semantic search directly in Postgres
- **OpenAI API** — `gpt-4o-mini` for summarization, `text-embedding-3-small` for embeddings
- **TanStack Query** — data fetching/caching on the client
- **React Hook Form + Zod** — form state and validation

## How it works

1. You paste in a title and some content.
2. The `/api/summarize` route sends the content to OpenAI for a short summary,
   generates a vector embedding of the text, and saves everything to Supabase.
3. Searching runs your query through the same embedding model, then Postgres
   (via `pgvector`) ranks documents by cosine similarity — see
   `match_documents()` in `supabase/schema.sql`.
4. Row-level security policies make sure you only ever see documents you own
   or have been explicitly granted access to (`document_access` table).

## Getting started

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a project at [supabase.com](https://supabase.com), then run the SQL
   in `supabase/schema.sql` in the Supabase SQL editor. This sets up the
   tables, RLS policies, and the `match_documents` search function, and
   enables the `pgvector` extension.

3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL,
   anon key, service role key, and an OpenAI API key.

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), sign up, and add your
   first document.

## Project structure

```
src/
  app/
    api/summarize/    # creates a document: summary + embedding + insert
    api/search/        # semantic search over the user's documents
    documents/          # new document form, single document view
    login/               # email/password auth
  components/          # UI components (forms, cards, search bar, nav)
  hooks/                 # TanStack Query hooks + auth state hook
  lib/
    supabase/            # browser + server Supabase clients
    ai.ts                 # OpenAI summarization + embeddings
    schemas.ts            # Zod validation schemas
  types/                 # shared TypeScript types
supabase/
  schema.sql             # tables, RLS policies, match_documents() function
```

## Notes / things I'd improve next

- File upload (PDF/docx) isn't wired up yet — right now you paste raw text.
  Would add parsing with something like `pdf-parse` before summarizing.
- No streaming on the summary response — could use the OpenAI streaming API
  so the summary appears progressively instead of all at once.
- Search currently only ranks by similarity threshold; could add hybrid
  search (keyword + semantic) for short/ambiguous queries.
