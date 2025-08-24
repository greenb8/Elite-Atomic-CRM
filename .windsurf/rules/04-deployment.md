---
trigger: model_decision
description: "Provides commands and requirements for deploying the Atomic CRM frontend and backend."
globs:
---
# Deployment and CI/CD

This rule provides critical information for deploying the Atomic CRM application.

## Backend Deployment

To deploy backend changes (database migrations and edge functions) to Supabase, run the following commands:

```sh
npx supabase db push
npx supabase functions deploy
```

## Frontend Deployment

1.  Build the frontend application:
    ```sh
    npm run build
    ```
2.  This creates a `dist` directory. Upload the contents of this directory to your hosting provider (e.g., Netlify, Vercel).

## GitHub Actions for CI/CD

To enable automated deployments via GitHub Actions, you must configure the following secrets in your GitHub repository settings:

-   `SUPABASE_ACCESS_TOKEN`: Your personal access token from `supabase.com/dashboard/account/tokens`.
-   `SUPABASE_DB_PASSWORD`: Your Supabase database password.
-   `SUPABASE_PROJECT_ID`: Your Supabase project ID.
-   `SUPABASE_URL`: Your Supabase project URL.
-   `SUPABASE_ANON_KEY`: Your Supabase project anonymous key.

If using the inbound email feature, also add:
-   `POSTMARK_WEBHOOK_USER`
-   `POSTMARK_WEBHOOK_PASSWORD`
-   `POSTMARK_WEBHOOK_AUTHORIZED_IPS`


## Github
- Make sure to keep things up to date by pushing changes to code. always ask the user before doing this though.