# Installation & Démarrage

## Prérequis
- Node 20+, pnpm 9+ (pour dev local hors Docker)
- Docker (optionnel, pour la stack complète)

## Dev rapide (API + Web séparés)
```bash
# 1) DB PostGIS
docker run --name agregateur-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=agregateur -p 5432:5432 -d postgis/postgis:16-3.4

# 2) Install (à la racine du repo)
pnpm -w install

# 3) Lancer
pnpm --filter @apps/api dev     # http://localhost:4000
pnpm --filter @apps/web dev     # http://localhost:3000
