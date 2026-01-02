# Terraform Configuration for Vercel + Cloudflare R2

This directory contains Terraform configuration to provision:
- Vercel Project (for hosting Next.js app)
- Vercel Postgres Database
- Cloudflare R2 Bucket (for file uploads)

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Cloudflare Account**: Sign up at https://cloudflare.com
3. **Terraform Cloud** (optional): For remote state management

## Setup

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your credentials:
   - **Vercel API Token**: Get from https://vercel.com/account/tokens
   - **Cloudflare API Token**: Get from https://dash.cloudflare.com/profile/api-tokens
   - **Cloudflare Account ID**: Get from https://dash.cloudflare.com/ (right sidebar)
   - **Cloudflare R2 Access Keys**: Create from Cloudflare R2 dashboard
   - **NextAuth Secret**: Generate with `openssl rand -base64 32`
   - **NextAuth URL**: Your production URL (e.g., https://nosoup.vercel.app)

3. Initialize Terraform:
   ```bash
   terraform init
   ```

4. Review the plan:
   ```bash
   terraform plan
   ```

5. Apply the configuration:
   ```bash
   terraform apply
   ```

## GitHub Secrets Required

For the GitHub Actions workflow to work, add these secrets to your repository:

### Terraform Cloud (if using remote state)
- `TF_CLOUD_ORGANIZATION` - Your Terraform Cloud organization name
- `TF_WORKSPACE` - Your Terraform Cloud workspace name
- `TF_API_TOKEN` - Your Terraform Cloud API token

### Vercel
- `VERCEL_TOKEN` - Your Vercel API token

### Cloudflare
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `R2_ACCESS_KEY_ID` - Your R2 access key ID
- `R2_SECRET_ACCESS_KEY` - Your R2 secret access key

### NextAuth
- `NEXTAUTH_SECRET` - Your NextAuth secret key (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., https://nosoup.vercel.app)

## Environment Variables Set by Terraform

Terraform automatically configures these environment variables in your Vercel project:
- `DATABASE_URL` - Postgres connection string
- `NEXTAUTH_URL` - Authentication URL
- `NEXTAUTH_SECRET` - Authentication secret
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - R2 bucket name
- `R2_USE_R2` - Flag to enable R2 storage

## Outputs

After applying, Terraform will output:
- `vercel_project_id` - ID of the Vercel project
- `vercel_project_name` - Name of the Vercel project
- `database_connection_string` - Postgres connection string (sensitive)
- `r2_bucket_name` - Name of the R2 bucket
- `deployment_url` - URL of your Vercel deployment

## Local Development

For local development, create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nosoup"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="nosoup-uploads"
R2_USE_R2="true"
```

## Deployment

The GitHub Actions workflow automatically:
1. Provisions infrastructure with Terraform
2. Runs Prisma migrations
3. Builds the Next.js app
4. Deploys to Vercel

Push to `main` branch to trigger deployment.

## Destroying Resources

To destroy all provisioned resources:
1. Run the destroy workflow manually from GitHub Actions with input "destroy"
2. Or locally: `terraform destroy`
