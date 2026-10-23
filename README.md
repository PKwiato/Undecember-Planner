# Undecember Build Planner

React + Vite + Tailwind + Motion, hosting: GitHub Pages, baza: Supabase.

1. Supabase: utwórz projekt, wklej `supabase/schema.sql` w SQL Editor.
2. Lokalnie: `cp .env.example .env`, uzupełnij URL i anon key, potem `npm install && npm run dev`.
3. GitHub: wrzuć repo na branch `main`. W Settings > Secrets > Actions dodaj `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`. W Settings > Pages ustaw Source na GitHub Actions.
4. Dane gry (klasy, skille, runy) są w `src/data/game.js`. To dane przykładowe, podmień je na prawdziwe.

Klucza `service_role` nigdy nie wstawiaj do tego repozytorium.
