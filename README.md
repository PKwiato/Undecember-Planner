# Undecember Build Planner

React + Vite + Tailwind + Motion, hosting: GitHub Pages, baza: Supabase.

1. Supabase: utwórz projekt, wklej `supabase/schema.sql` w SQL Editor (lub uruchom migrację dodającą `user_id` i polityki RLS dla uwierzytelnionych użytkowników).
2. Supabase Auth: w zakładce Authentication > Providers upewnij się, że włączony jest Email provider.
3. Lokalnie: `cp .env.example .env`, uzupełnij URL i anon key, potem `npm install && npm run dev`.
4. GitHub: wrzuć repo na branch `main`. W Settings > Secrets > Actions dodaj `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`. W Settings > Pages ustaw Source na GitHub Actions.
5. Dane gry (klasy, skille, runy) są w `src/data/game.js`. To dane przykładowe, podmień je na prawdziwe.

Klucza `service_role` nigdy nie wstawiaj do tego repozytorium.
