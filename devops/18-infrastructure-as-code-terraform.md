# Reliability 4: Infrastructure as Code with Terraform

> **In one sentence:** Infrastructure as Code (IaC) describes your cloud resources in versioned files, so environments are reproducible, reviewable, and — critically for disaster recovery — rebuildable in a new region in minutes instead of days.

**Level:** Intermediate → Advanced · **You'll learn:** Terraform basics (providers, resources, variables, state), the plan/apply workflow, remote state and locking, modules, multi-region setups, drift, and running Terraform in CI/CD.

## See it in action

<div class="sim" data-sim="pipeline" data-title="Terraform workflow" data-steps="Write .tf files|terraform init|terraform fmt & validate|terraform plan|Review in PR|terraform apply|State updated" data-labels="Declare the desired infrastructure|Download providers, configure backend|Style and syntax checks|Diff: what will be created/changed/destroyed|Humans approve the plan output|Make real API calls to the cloud|Terraform records what exists"><em>Interactive animation available on the website.</em></div>

## Why IaC matters for reliability

- **Rebuild after disaster:** point the same code at another region and apply.
- **No snowflakes:** staging and production are built from the same code.
- **Review & audit:** infrastructure changes go through pull requests like application code.
- **Drift detection:** spot manual console changes.

Alternatives: OpenTofu (open-source Terraform fork), Pulumi (general-purpose languages), AWS CloudFormation/CDK, Crossplane (Kubernetes-native).

## Core concepts

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"             # pin provider versions
    }
  }
}

provider "aws" {
  region = var.primary_region
}

variable "primary_region" {
  type    = string
  default = "us-east-1"
}

resource "aws_s3_bucket" "backups" {                       # resource "TYPE" "NAME"
  bucket = "notes-backups-${var.primary_region}"
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id                         # reference → dependency
  versioning_configuration {
    status = "Enabled"
  }
}

output "bucket" {
  value = aws_s3_bucket.backups.bucket
}
```

| Concept | Meaning |
|---------|---------|
| **Provider** | Plugin talking to an API (AWS, GCP, Azure, Kubernetes, Cloudflare, GitHub…) |
| **Resource** | Something Terraform creates and manages |
| **Data source** | Read-only lookup of existing things |
| **Variable / output** | Inputs and exported values |
| **State** | Terraform's record mapping code to real resource IDs |
| **Module** | Reusable package of resources (e.g., a standard VPC or service) |

## The workflow

```bash
terraform init                    # download providers, set up backend
terraform fmt -check && terraform validate
terraform plan -var-file=prod.tfvars -out=plan.tfplan
terraform apply plan.tfplan       # applies exactly what was reviewed
terraform destroy                 # careful!
```

Read plans carefully: `+` create, `~` update in place, `-/+` **replace** (destroy then create — dangerous for databases), `-` destroy. Protect critical resources:

```hcl
resource "aws_db_instance" "main" {
  # ...
  deletion_protection = true
  lifecycle {
    prevent_destroy = true
  }
}
```

## State: the part that bites people

- State contains resource IDs and sometimes **secrets** → store it remotely, encrypted, with restricted access — never in git.
- **Locking** prevents two people applying at once (S3 backend with a lock table, Terraform Cloud, GCS).
- Back up state (versioned bucket); losing it means Terraform no longer knows what it manages.
- Split state by environment and component (network, data, apps) to limit blast radius and speed up plans.

```hcl
terraform {
  backend "s3" {
    bucket         = "notes-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

## Multi-region with provider aliases

The reliability example ([`examples/reliability/terraform`](examples/reliability/terraform/versions.tf)) uses two provider instances — one per region — to create a backup bucket with **Object Lock** in the primary region, a replica bucket in the DR region, cross-region replication, and **Route 53 health-checked failover** records:

```hcl
provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

resource "aws_s3_bucket" "backups_dr" {
  provider            = aws.dr
  bucket              = "${var.app_name}-backups-${var.dr_region}"
  object_lock_enabled = true
}
```

These files pass `terraform fmt -check` and `terraform validate` with the AWS provider v5.70.

## Modules and environments

```
infra/
├── modules/
│   ├── network/      (VPC, subnets across 3 AZs)
│   ├── k8s-cluster/
│   └── service/
└── live/
    ├── staging/us-east-1/   main.tf → module calls with staging values
    ├── prod/us-east-1/
    └── prod/us-west-2/      ← DR region: same modules, different variables
```

Rebuilding in a new region becomes "add a folder with the same module calls and apply".

## Terraform in CI/CD

1. On pull request: `fmt -check`, `validate`, security scans (tfsec/Checkov/Trivy config), `plan` → post the plan as a PR comment.
2. On merge: `apply` the saved plan, with approval for production (environment protection rules — see [CI/CD](11-ci-cd-with-github-actions.md)).
3. Authenticate with **OIDC** (short-lived cloud credentials), not stored keys.
4. Nightly `plan` on production to detect **drift** (manual changes) and alert.

## Common mistakes

- Applying from laptops with local state.
- Huge single state files (slow plans, big blast radius).
- Not reading `-/+` replacements before applying.
- Hardcoding secrets in `.tf` files or tfvars committed to git.
- Mixing manual console changes with Terraform-managed resources.

## Quick check

**Q: Why use `terraform plan -out` and then apply that file?**

A: It guarantees that what gets applied is exactly what was reviewed, even if the code or remote state changes between review and apply.

**Q: How does IaC reduce your RTO in a regional disaster?**

A: The whole environment (network, cluster, databases, DNS) can be created in the DR region from the same tested code in minutes, instead of rebuilding by hand from memory under pressure.

**Next:** [Observability & alerting](19-observability-and-alerting.md)
