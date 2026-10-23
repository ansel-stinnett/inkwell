## Definition of Done

A backlog item is Done when:
- [ ] Code is committed with a descriptive message
- [ ] It runs locally per the relevant lecture's Code Walkthrough
- [ ] It does not break previously-passing verification steps
- [ ] New setup steps are documented here

## Process

Inkwell follows an incremental process: one lecture, one increment.
See docs/BACKLOG.md for the current product backlog.

## Getting Started

### Prerequisites
- Node.js >= 20.6 (see server/package.json's engines field)
- PostgreSQL 16, either natively or in Docker

### Database

This project was developed against a WSL-native PostgreSQL install:

```
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER inkwell WITH PASSWORD 'inkwell' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE inkwell_dev OWNER inkwell;"
```

CREATEDB is required: prisma migrate dev creates a temporary shadow database
on every run and fails with P3014 without it.

WSL does not auto-start PostgreSQL, so sudo service postgresql start is
needed after each reboot.

### Server

```
cd server
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma generate
npm run dev
# -> Inkwell API listening on port 4000
```

The .env needs DATABASE_URL="postgresql://inkwell:inkwell@localhost:5432/inkwell_dev"

### Client

```
cd client
npm install
npm run dev
# -> Local: http://localhost:5173
```

### Running the tests

The integration tests run against a separate inkwell_test database, never the
dev one. Created once:

```
sudo -u postgres psql -c "CREATE DATABASE inkwell_test OWNER inkwell;"
cd server
DATABASE_URL="postgresql://inkwell:inkwell@localhost:5432/inkwell_test" npx prisma migrate deploy
```

Create server/.env.test holding that same DATABASE_URL. It is gitignored.

```
cd server && npm test        # Jest: unit + integration
cd client && npx vitest run  # Vitest: component tests
npx playwright test          # Playwright: E2E (starts both dev servers itself)
```
