variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "d1_database_name" {
  description = "Name of the D1 database"
  type        = string
  default     = "nosoup-db"
}

variable "r2_bucket_name" {
  description = "Name of the R2 bucket for uploads"
  type        = string
  default     = "nosoup-uploads"
}

variable "r2_bucket_location" {
  description = "Location for R2 bucket"
  type        = string
  default     = "WNAM"
}

variable "pages_project_name" {
  description = "Name of the Cloudflare Pages project"
  type        = string
  default     = "nosoup"
}

variable "production_branch" {
  description = "Production branch for the Pages project"
  type        = string
  default     = "main"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}
