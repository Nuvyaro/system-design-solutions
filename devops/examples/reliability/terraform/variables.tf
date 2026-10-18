variable "primary_region" {
  description = "Region that normally serves traffic"
  type        = string
  default     = "us-east-1"
}

variable "dr_region" {
  description = "Disaster-recovery region, far enough away to avoid shared natural disasters"
  type        = string
  default     = "us-west-2"
}

variable "app_name" {
  description = "Prefix for resource names"
  type        = string
  default     = "notes"
}

variable "domain_zone_id" {
  description = "Route 53 hosted zone ID for the public domain"
  type        = string
}

variable "primary_endpoint" {
  description = "Hostname of the primary region's load balancer"
  type        = string
}

variable "dr_endpoint" {
  description = "Hostname of the DR region's load balancer"
  type        = string
}

variable "backup_retention_days" {
  description = "How long backups are kept (and locked against deletion)"
  type        = number
  default     = 35
}
