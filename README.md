# Agregateur FR — Urbex (MVP)

## Ce que contient ce MVP
- **Front (Next.js)** : `/sites` liste les sites (seed JSON).
- **API (Fastify)** : `/api/sites` retourne des sites paginés/filtrés.
- **Favicon** : `public/favicon.svg`.

## Lancer / Déployer
- Hébergé sur Render :
  - API : `agregateur-fr` (Node 20)
  - Web : `agregateur-fr-web` (NEXT_PUBLIC_API_URL pointant vers l’API)
- Build Web : installe aussi les devDeps (`pnpm install --prod=false`).

## Données (seed)
- Fichier : `data/seed/sites.json`.  
- Format (extraits) :
  ```json
  { "id":"seed-001", "name":"Ancienne usine", "kind":"friche-industrielle", "region":"Île-de-France", "dept_code":"93", "score":3.5, "sources":[{"type":"pdf","ref":"..."}] }

## Pipeline data (local)

1) Déposez vos PDF dans `data/pdfs/`
2) Ingestion semi-auto → seed JSON :
   pnpm seed:ingest
   (génère/merge `data/seed/sites.json`)
3) Génération GeoJSON pour la carte :
   pnpm geo:build
   (écrit `apps/web/public/sites.geojson`)
4) Commit & push : Render redéploie le front et l’API.
