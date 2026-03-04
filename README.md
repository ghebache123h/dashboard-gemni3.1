# AI Support Analytics Dashboard

This is a Next.js 14 dashboard built to receive webhook telemetry from n8n workflows and display KPIs regarding Token Cost, OTP Success rates, and an Escalation Support CRM.

## Deployment with Dokploy (VPS) - All-In-One Docker Compose

This project is fully configured to be deployed as a single, all-in-one Compose Application inside Dokploy. It will automatically build and spin up both the **Analytics Dashboard** and a bundled **PostgreSQL Database** for you.

### How to Deploy
1. Go to **Applications** in Dokploy.
2. Under "Type", select **Compose**.
3. Create the application.
4. Select **Github** and link your repository: `ghebache123h/dashboard-gemni3.1`.
5. Specify the internal paths:
   - Compose Path: `docker-compose.yml`
6. Click **Deploy**. 

Dokploy will read the `docker-compose.yml` file, pull the PostgreSQL image, and build the Next.js Dockerfile cleanly. The startup scripts included will automatically format your database schema.

*(Note: There is no need to create a separate database service in Dokploy! Everything is bundled inside this repo using Compose).*

## Local Development (Testing)

If you are running this locally without Docker:
1. Change `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma`.
2. Change `url = env("DATABASE_URL")` to `url = "file:./dev.db"`.
3. Run `npm install`
4. Run `npx prisma db push`
5. Run `npm run dev`
