# Deployment Guide

This guide will help you deploy Orca Property Management to production using Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine for staging)
- A PostgreSQL database for production

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

1. Authenticate with GitHub:
   ```bash
   gh auth login
   ```
   Follow the prompts to log in via web browser.

2. Create a new repository:
   ```bash
   gh repo create orca-property-management --public --source=. --remote=origin --push
   ```

### Option B: Using GitHub Web Interface

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `orca-property-management`
3. Don't initialize with README (we already have code)
4. Click "Create repository"
5. Follow the instructions to push your existing repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/orca-property-management.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Production Database

Choose one of these options:

### Option A: Vercel Postgres (Recommended for Vercel deployments)

1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option B: Neon (Free tier available)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (starts with `postgres://`)
4. Save this for Step 3

### Option C: Supabase (Free tier available)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (Connection pooling → Transaction mode)
5. Save this for Step 3

## Step 3: Deploy to Vercel

### Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click "Add New" → "Project"
3. Import your GitHub repository (`orca-property-management`)
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=<your-postgres-connection-string>
   NEXTAUTH_URL=<will be provided after first deployment>
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   NODE_ENV=production
   ```

6. Click "Deploy"

7. After first deployment:
   - Copy your deployment URL (e.g., `https://orca-property-management.vercel.app`)
   - Go to Project Settings → Environment Variables
   - Update `NEXTAUTH_URL` with your deployment URL
   - Redeploy to apply changes

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```
   Follow the prompts and add environment variables when asked.

## Step 4: Run Database Migrations

After deployment, you need to run Prisma migrations on your production database:

1. Set the production `DATABASE_URL` locally (temporarily):
   ```bash
   export DATABASE_URL="your-production-database-url"
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Verify the schema:
   ```bash
   npx prisma db push
   ```

## Step 5: Verify Deployment

1. Visit your deployment URL
2. Try to sign up for a new account
3. Test creating a property, unit, tenant, and lease
4. Verify all features work as expected

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your production URL | `https://orca.vercel.app` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (min 32 chars) | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | Environment mode | `production` |

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a preview URL

## Troubleshooting

### Build Fails

- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json` (not devDependencies)
- Verify environment variables are set correctly

### Database Connection Issues

- Ensure `DATABASE_URL` includes `?sslmode=require` for production databases
- Check if your database provider requires IP whitelisting
- Verify database credentials are correct

### Authentication Issues

- Ensure `NEXTAUTH_URL` matches your deployment URL exactly
- Verify `NEXTAUTH_SECRET` is set and at least 32 characters
- Check that cookies are allowed in your browser

### Migration Issues

- If migrations fail, check your database URL
- Ensure you're using the production database, not local
- Try running `npx prisma db push` to sync the schema

## Next Steps

After successful deployment:

1. Set up a custom domain (optional)
2. Configure analytics (Vercel Analytics)
3. Set up error monitoring (Sentry)
4. Enable preview deployments for testing
5. Start building Week 1 feature: Payment Integration

## Cost Estimates

**Free Tier Limits**:
- Vercel: Free for personal projects (100GB bandwidth/month)
- Vercel Postgres: 256MB storage, 60 hours compute time/month (free)
- Neon: 0.5GB storage, 100 hours compute time/month (free)
- Supabase: 500MB database, 1GB file storage (free)

**Recommended for Production**:
- Start with free tier for staging/testing
- Upgrade when you reach ~50-100 active users
- Monitor usage in dashboard



URL: https://orca-property-management.vercel.app
Database: Supabase PostgreSQL (pooled connection)
Auto-deploy: Enabled via GitHub integration 


Fedamchaina.1