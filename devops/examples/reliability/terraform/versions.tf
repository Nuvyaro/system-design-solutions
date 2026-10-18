terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }

  # Keep state remote, versioned and locked — never on a laptop.
  # backend "s3" {
  #   bucket         = "notes-terraform-state"
  #   key            = "reliability/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.primary_region
}

# Second provider instance for the disaster-recovery region
provider "aws" {
  alias  = "dr"
  region = var.dr_region
}
