# Hobby Tracker Application

A full-stack web application to track your hobbies and time spent on them. Built with Next.js, TypeScript, and SQLite.

## Features

- Simple authentication with username/password
- Add, edit, and delete hobbies
- Track time spent on each hobby with session logging
- View session history for each hobby
- Categorize hobbies
- Beautiful, responsive UI

## Default Credentials

**Username:** `admin`
**Password:** `hobby123`

## Tech Stack

- **Frontend:** Next.js 14 with App Router, React, TypeScript
- **Backend:** Next.js API Routes
- **Database:** SQLite with better-sqlite3
- **Authentication:** JWT with HTTP-only cookies
- **Styling:** CSS Modules
- **Deployment:** Vercel via GitHub Actions

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ClaudeHobbyTracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will create a SQLite database automatically in the `data/` directory on first run.

## Production Build

To create a production build:

```bash
npm run build
npm start
```

## Deployment

This application is configured to deploy automatically to Vercel using GitHub Actions.

### Deploy to Vercel

#### Option 1: Automatic Deployment via GitHub Actions

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** locally:
```bash
npm i -g vercel
```

3. **Link your project to Vercel:**
```bash
vercel link
```
This will create `.vercel` directory with project configuration.

4. **Get your Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Copy the token

5. **Add GitHub Secrets:**
   - Go to your GitHub repository Settings → Secrets and variables → Actions
   - Add a new secret: `VERCEL_TOKEN` with your token value

6. **Get Vercel Project Details:**
```bash
cat .vercel/project.json
```
Copy the `projectId` and `orgId`

7. **Add more GitHub Secrets:**
   - `VERCEL_ORG_ID` - your org ID from project.json
   - `VERCEL_PROJECT_ID` - your project ID from project.json

8. **Push to main branch or any branch starting with `claude/`:**
```bash
git push origin main
```

The GitHub Action will automatically deploy your application!

#### Option 2: Manual Deployment via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to complete deployment

#### Option 3: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and deploy

### Important Notes for Deployment

⚠️ **Database Persistence:** The SQLite database is file-based. On Vercel's serverless platform, the filesystem is ephemeral. For production use with persistent data, consider:

1. **Vercel Postgres** (recommended for production):
   - Add Vercel Postgres to your project
   - Update database code to use PostgreSQL

2. **Vercel KV** (for key-value storage):
   - Good for session data and simple storage

3. **External Database:**
   - Use a hosted PostgreSQL, MySQL, or MongoDB service
   - Update connection configuration

For demo/testing purposes, the current SQLite setup works fine, but data will reset when the serverless function cold-starts.

## Project Structure

```
ClaudeHobbyTracker/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   └── hobbies/       # Hobby and session CRUD endpoints
│   ├── dashboard/         # Main dashboard UI
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Root page (redirects to login)
│   └── globals.css       # Global styles
├── lib/
│   ├── auth.ts           # Authentication utilities
│   └── db.ts             # Database setup and initialization
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions deployment workflow
├── middleware.ts         # Route protection middleware
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Hobbies
- `GET /api/hobbies` - Get all hobbies
- `POST /api/hobbies` - Create a new hobby
- `GET /api/hobbies/[id]` - Get a single hobby
- `PUT /api/hobbies/[id]` - Update a hobby
- `DELETE /api/hobbies/[id]` - Delete a hobby

### Sessions
- `GET /api/hobbies/[id]/sessions` - Get all sessions for a hobby
- `POST /api/hobbies/[id]/sessions` - Create a new session

## Security Notes

- Passwords are hashed using bcryptjs
- Authentication uses JWT tokens stored in HTTP-only cookies
- All API routes check authentication
- CSRF protection through SameSite cookies
- For production, set a strong `JWT_SECRET` environment variable

## Environment Variables

Create a `.env.local` file for local development:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

For Vercel deployment, add this in the Vercel dashboard under Settings → Environment Variables.

## License

See LICENSE file for details.

## Support

For issues or questions, please open an issue in the GitHub repository.

---

**Happy Hobby Tracking! 🎨🎮🎸📚🏃**
