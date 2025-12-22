output "vercel_project_id" {
  description = "ID of the Vercel project"
  value       = vercel_project.nosoup.id
}

output "vercel_project_name" {
  description = "Name of the Vercel project"
  value       = vercel_project.nosoup.name
}

output "database_connection_string" {
  description = "Postgres database connection string"
  value       = vercel_postgres_database.nosoup_db.connection_string
  sensitive   = true
}

output "r2_bucket_name" {
  description = "Name of the R2 bucket"
  value       = cloudflare_r2_bucket.nosoup_uploads.name
}

output "deployment_url" {
  description = "URL of the Vercel deployment"
  value       = "https://${vercel_project.nosoup.name}.vercel.app"
}
