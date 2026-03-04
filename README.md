# AI Support Analytics Dashboard

This is a Next.js 14 dashboard built to receive webhook telemetry from n8n workflows and display KPIs regarding Token Cost, OTP Success rates, and an Escalation Support CRM.

## Deployment with Dokploy (VPS)

This project is already pre-configured for a seamless deployment using Dokploy on your VPS.

### Prerequisites in Dokploy
1. Create a **PostgreSQL Database** in Dokploy.
2. Note the generated `DATABASE_URL` connection string.

### Deploying the App
1. Go to **Applications** in Dokploy and create a new App.
2. Connect this GitHub repository: `ghebache123h/dashboard-gemni3.1`.
3. Set the Environment variable:
   - `DATABASE_URL="your-postgresql-url-here"`
4. In the Deployment Settings, Dokploy will automatically detect the **Dockerfile**.
5. Click **Deploy**. Dokploy will build the standalone Next.js image securely and start it.

*(Note: Prisma automatically generates the client during build due to the `postinstall` script. You must run `npx prisma db push` manually via Dokploy's terminal or run it locally pointed to your production DB to initialize the tables the first time).*

## Local Development (Testing)

If you are running this locally without Docker:
1. Change `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma`.
2. Change `url = env("DATABASE_URL")` to `url = "file:./dev.db"`.
3. Run `npm install`
4. Run `npx prisma db push`
5. Run `npm run dev`
