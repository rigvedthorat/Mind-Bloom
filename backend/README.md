# Mind-Bloom Backend

The Mind-Bloom backend is a TypeScript and Express REST API for authentication, journal storage, mood-based affirmations, and OpenAI-powered quote recommendations.

## Technology Stack

- Node.js, Express, and TypeScript
- PostgreSQL
- Prisma ORM for application database access
- Knex.js for migrations and seed data
- OpenAI API for journal-context quote recommendations
- JWT and bcrypt for authentication
- Docker and Google Cloud Run deployment support

## Local Development

1. Install Node.js and PostgreSQL 17.

   ```shell
   brew install node postgresql@17
   brew services run postgresql@17
   ```

2. Set up environment variables.

   ```shell
   cp .env.example .env
   cp .env.local.example .env.local
   ```

   Put real secrets only in `.env.local`, which is ignored by Git.

   ```shell
   export OPENAI_API_KEY="your-openai-api-key"
   export OPENAI_MODEL="gpt-4o-mini"
   ```

3. Install dependencies.

   ```shell
   npm install
   ```

4. Set up the database.

   ```shell
   source .env
   psql postgres < databases/create_databases.sql
   npm run migrate
   DATABASE_URL="postgresql://capstone_starter:capstone_starter@localhost:5432/capstone_starter_test" npm run migrate
   npx knex seed:run --knexfile databases/knexfile.js
   npx prisma generate
   ```

5. Run tests.

   ```shell
   npm run test
   ```

6. Run the API locally.

   ```shell
   source .env
   source .env.local
   npm run build
   npm run start
   ```

   The API listens on [localhost:8787](http://localhost:8787).

## API Routes

- `POST /api/auth/register` - Register a user.
- `POST /api/auth/login` - Log in and receive a JWT.
- `POST /api/journal` - Create a journal entry and receive a context-aware inspirational quote.
- `GET /api/journal` - List journal entries for the authenticated user.
- `GET /api/journal/:id` - Get one journal entry.
- `GET /api/journal/date/:date` - Get entries for a date in `YYYY-MM-DD` format.
- `GET /api/affirmation/today?mood=Happy` - Get a random mood-based affirmation.
- `GET /api/affirmations/:mood` - List affirmations for a mood.

## Database Changes

Use Knex for schema migrations:

```shell
npx knex migrate:make "[Description of change]" --knexfile databases/knexfile.js
```

Update `prisma/schema.prisma` when application models change, then regenerate the Prisma client:

```shell
npx prisma generate
```

## Build Container

```shell
npm run build
docker build -t mind-bloom-backend .
docker run -p 8787:8787 --env-file .env.docker mind-bloom-backend
```

## Deploy to Cloud Run

Create Google Cloud Secret Manager secrets for:

```shell
mind-bloom-database-url
mind-bloom-jwt-secret
mind-bloom-openai-api-key
```

Then submit the backend build from the repository root:

```shell
gcloud builds submit backend --config backend/cloudbuild.yaml
```
