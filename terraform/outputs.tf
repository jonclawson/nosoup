output "d1_database_id" {
  description = "ID of the D1 database"
  value       = cloudflare_d1_database.nosoup_db.id
}

output "d1_database_name" {
  description = "Name of the D1 database"
  value       = cloudflare_d1_database.nosoup_db.name
}

output "r2_bucket_name" {
  description = "Name of the R2 bucket"
  value       = cloudflare_r2_bucket.nosoup_uploads.name
}

output "pages_project_name" {
  description = "Name of the Cloudflare Pages project"
  value       = cloudflare_pages_project.nosoup.name
}

output "pages_url" {
  description = "URL of the Cloudflare Pages project"
  value       = "https://${cloudflare_pages_project.nosoup.subdomain}.pages.dev"
}
