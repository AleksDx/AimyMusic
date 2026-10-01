# AimyMusic

A web music streaming app built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, Howler.js, and Zustand. Uses Supabase for auth and data.

## Features

- Email/password and Google OAuth authentication
- Home feed with AI-curated carousels
- Full-screen player with animated aura effect and Howler.js audio
- Persistent mini-player across all screens
- Playlists with drag-and-drop song reordering
- 3D stacked queue view
- AimyMusic Wrapped — scroll-snap year-in-review with listening stats and animated aura orb
- Glassmorphic dark UI with mint green and coral accents

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Howler.js (audio engine)
- Zustand (state management)
- Supabase (auth + database)
- @dnd-kit (drag-and-drop)

## Environment Variables

See `.env.example` for the required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
