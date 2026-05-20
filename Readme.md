# Mind-Bloom: Journal & Wellness Application

## Overview

Mind-Bloom is a full-stack journaling and mental wellness application that helps users track moods, write daily journal entries, revisit past reflections through a calendar, and receive supportive inspirational quotes matched to their journal context.

## Features

- **User Authentication**: Register and log in with JWT-based authentication.
- **Mood Tracking**: Select from 12 mood states while writing journal entries.
- **Daily Journaling**: Save mood-based journal entries to PostgreSQL.
- **AI-Powered Quotes**: Generate context-aware inspirational quotes from journal content and mood through the OpenAI API.
- **Affirmation Fallbacks**: Return seeded mood-based affirmations when needed.
- **Calendar View**: Browse past journal entries through an interactive calendar.

## Technology Stack

### Backend

- **Node.js, Express, and TypeScript**: REST API server.
- **PostgreSQL**: Relational database for users, journal entries, affirmations, and quote recommendations.
- **Prisma ORM**: Structured database access for application routes and persistence.
- **Knex.js**: Database migration and seed workflow.
- **OpenAI API**: Journal-context quote recommendation.
- **JWT and bcrypt**: Authentication and password hashing.
- **Docker and Cloud Run**: Container-ready backend deployment path for Google Cloud Platform.

### Frontend

- **React 19 and TypeScript**: Single Page Application.
- **React Router**: Client-side routing.
- **Tailwind CSS and ShadCN UI**: Styling and UI components.
- **Framer Motion**: UI animation.
- **React Hook Form**: Form handling and validation.
- **Vite and Vercel**: Frontend build and deployment path.

## Architecture

Mind-Bloom uses a decoupled frontend and backend:

1. **Frontend**: React SPA sends authenticated API requests.
2. **Backend**: Express API validates JWTs, coordinates journal workflows, and calls OpenAI for quote recommendations.
3. **Database**: PostgreSQL stores users, journal entries, seeded affirmations, and persisted quote metadata through Prisma models.

### Data Flow

```text
User -> React Frontend -> Express API -> Prisma ORM -> PostgreSQL
                              |
                              v
                         OpenAI API
                              |
                              v
                    Personalized quote response
```

## Project Structure

```text
Mind-Bloom/
├── backend/                 # Express API server
│   ├── databases/           # Knex migrations and seeds
│   ├── prisma/              # Prisma schema
│   └── src/                 # Server source code
│       ├── databaseSupport/ # Database clients
│       ├── routes/          # API routes
│       ├── services/        # OpenAI quote recommendation service
│       ├── views/           # Handlebars templates
│       └── webSupport/      # Server utilities
└── frontend/                # React SPA
    ├── public/              # Static assets
    └── src/                 # Client source code
        ├── api/             # API client
        ├── components/      # Reusable UI components
        ├── context/         # React context providers
        ├── pages/           # Page components
        ├── sections/        # Journal and calendar sections
        └── types/           # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 17
- Git
- OpenAI API key for live AI quote recommendations

### Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/rigvedthorat/Mind-Bloom.git
   cd Mind-Bloom
   ```

2. Set up backend environment variables.

   ```bash
   cp backend/.env.example backend/.env
   cp backend/.env.local.example backend/.env.local
   ```

   Add your OpenAI key only to `backend/.env.local`. This file is ignored by Git.

   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   export OPENAI_MODEL="gpt-4o-mini"
   ```

3. Install backend dependencies.

   ```bash
   cd backend
   npm install
   ```

4. Set up the database.

   ```bash
   source .env
   psql postgres < databases/create_databases.sql
   npm run migrate
   DATABASE_URL="postgresql://capstone_starter:capstone_starter@localhost:5432/capstone_starter_test" npm run migrate
   npx knex seed:run --knexfile databases/knexfile.js
   npx prisma generate
   ```

5. Install frontend dependencies.

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   ```

## Running the Application

1. Start the backend server.

   ```bash
   cd backend
   source .env
   source .env.local
   npm run build
   npm run start
   ```

2. Start the frontend development server in another terminal.

   ```bash
   cd frontend
   npm run dev
   ```

3. Open <http://localhost:5173>.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in and receive a JWT token.

### Journal Entries

- `POST /api/journal` - Create a journal entry and receive a context-aware quote.
- `GET /api/journal` - Get all journal entries for the logged-in user.
- `GET /api/journal/:id` - Get a specific journal entry by ID.
- `GET /api/journal/date/:date` - Get entries for a specific date.

### Affirmations

- `GET /api/affirmation/today?mood=Happy` - Get a random affirmation for the specified mood.
- `GET /api/affirmations/:mood` - Get all affirmations for a specific mood.

## Testing

Run backend tests:

```bash
cd backend
npm run test
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Deployment

### Frontend: Vercel

Deploy the `frontend/` directory as a Vite project and set:

```bash
VITE_API_URL="https://your-backend-url/api"
```

### Backend: Google Cloud Platform

The backend includes Docker and Cloud Build configuration for deploying to Cloud Run. Configure these runtime environment variables in Google Cloud Secret Manager or Cloud Run settings:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="your-production-jwt-secret"
JWT_EXPIRATION="24h"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"
```

Do not commit `.env` or `.env.local` files with real secrets.

## Acknowledgments

- [OpenAI](https://openai.com/) for AI quote recommendation capabilities
- [Prisma](https://www.prisma.io/) for ORM tooling
- [PostgreSQL](https://www.postgresql.org/) for relational data persistence
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [ShadCN UI](https://ui.shadcn.com/) for component patterns
