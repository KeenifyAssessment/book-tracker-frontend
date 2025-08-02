📚 Book Tracker SaaS

A full-stack Book Tracker application for managing your personal library. Built with React + Vite on the frontend and FastAPI on the backend. Includes authentication, book status tracking, and responsive design.
🧭 Overview

    🔐 User Auth via Supabase

    📖 Book Management (Add, Edit, Delete)

    📊 Status Tracking: Reading, Completed, Wishlist

    🧼 Filter by Status

    📱 Responsive UI for all devices

🏗️ Tech Stack
Frontend (📁 Separate Repo)

    React 18 + Vite

    Supabase JS Client

    CSS3 (custom/responsive)

Backend (📁 Separate Repo)

    FastAPI

    Supabase (DB + Auth)

    JWT Auth

    Python 3.9+

📦 Project Setup
🔑 Supabase Setup (shared across both repos)

    Go to supabase.com and create a new project.

    In the SQL Editor, run:

create table books (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  status text check (status in ('reading', 'completed', 'wishlist')) default 'reading',
  created_at timestamptz default now()
);

alter table books enable row level security;

create policy "Users can view own books" on books for select using (auth.uid() = user_id);
create policy "Users can insert own books" on books for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on books for update using (auth.uid() = user_id);
create policy "Users can delete own books" on books for delete using (auth.uid() = user_id);

    Go to Settings > API:

        Copy the Project URL and anon public key

        Go to JWT Settings and copy the JWT Secret


🌐 Frontend Setup (React + Vite) — book-tracker-frontend
Prerequisites

    Node.js 16+

    Supabase account

Installation

git clone https://github.com/KeenifyAssessment/book-tracker-fontend.git
cd book-tracker-frontend

npm install

Environment Variables (.env)

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000

Run Dev Server

npm run dev

    App will be available at http://localhost:5173

📡 API Endpoints
Method	Endpoint	Description
GET	/	Health check
POST	/books	Add new book
GET	/books	Get all books (filter optional)
PATCH	/books/{id}	Update book status
DELETE	/books/{id}	Delete a book

    All endpoints (except /) require JWT via Authorization header.

Frontend Vercel

    Push frontend repo to GitHub

    Import project on Vercel or Netlify

    Add env variables in the dashboard

    Update VITE_API_URL to point to the deployed backend

    Deploy!

🧪 Test Credentials

Use these for testing (or create your own):

Email: Abderrahmane.bouzemlal@student.aiu.edu.my
Password: Ye=?a'k>*KeN2+m

🎯 How to Use

    Sign up / Sign in with email/password

    Add books (title, author, status)

    View your personal library

    Filter books by status (Reading / Completed / Wishlist)

    Update or delete books anytime

🔒 Security Highlights

    JWT Auth for all API requests

    Secure handling of environment secrets

    Input validation and error handling on both frontend and backend

🎥 Demo Video

https://www.loom.com/share/bc88d1933a76475da2b8ee01c155739c?sid=2fd9a671-902e-47fe-8747-2b66aa55adb9

📄 License

This project was developed as part of the Keenify technical assessment.
🤝 Contributing

As this is an assessment submission, contributions are not currently accepted.
