# Reliability 8: DevSecOps & Software Supply-Chain Security

> **In one sentence:** DevSecOps builds security into every stage of delivery — code, dependencies, images, pipelines, clusters, and cloud accounts — so attacks (a major cause of "disasters" today) are prevented, detected, and recoverable.

**Level:** Intermediate → Advanced · **You'll learn:** shift-left security checks, secrets management, dependency and image scanning, SBOMs, image signing, pipeline hardening, Kubernetes and cloud security, and preparing for security incidents.

## See it in action

<div class="sim" data-sim="pipeline" data-title="Security gates in the pipeline" data-steps="Commit|Secret scan|SAST & dependency scan|Build image|Image scan + SBOM|Sign image|Admission policy|Runtime detection" data-labels="Pre-commit hooks, signed commits|Block leaked keys (gitleaks / push protection)|Code flaws + known-vulnerable libraries|Minimal, pinned base image|Trivy/Grype; generate SBOM (SPDX/CycloneDX)|cosign keyless signing with OIDC|Cluster only runs signed, policy-compliant images|Falco/eBPF alerts on suspicious behavior"><em>Interactive animation available on the website.</em></div>

## Why it belongs in reliability

Ransomware, stolen credentials, and compromised dependencies cause some of the longest outages and worst data losses. Security controls reduce the chance; backups, isolation, and incident response reduce the damage.

## 1. Secrets management

- **Never** commit secrets. Enable secret scanning / push protection on the repo; run `gitleaks` in CI.
- Store secrets in a manager (Vault, AWS Secrets Manager, GCP Secret Manager) and sync into Kubernetes with External Secrets Operator — see [Config & storage](08-kubernetes-config-and-storage.md).
- Prefer **short-lived credentials**: OIDC federation from CI to the cloud, IAM roles for service accounts (IRSA / Workload Identity) instead of static keys.
- Rotate on a schedule and immediately after any suspected leak.

## 2. Code and dependencies

- **SAST** (static analysis: CodeQL, Semgrep) on pull requests.
- **Dependency scanning** (Dependabot, Renovate, `pip-audit`, `npm audit`, Trivy fs): known CVEs in libraries; automated update PRs.
- **Lockfiles and pinned versions**; review new dependencies (popularity, maintenance, typosquatting risk).
- Pin GitHub Actions to versions or commit SHAs; least-privilege `permissions:` per job (as in the [CI/CD pipeline](11-ci-cd-with-github-actions.md)).

## 3. Container images

- Minimal base images (slim/distroless), non-root user, no shells or package managers in runtime images where possible — see [Dockerfiles](02-writing-dockerfiles.md).
- Scan images in CI (the example pipeline fails on CRITICAL/HIGH fixed CVEs with Trivy) and continuously in the registry.
- Generate an **SBOM** (software bill of materials) for every image so you can answer "are we affected by the new CVE?" in minutes:
  ```bash
  syft ghcr.io/nuvyaro/notes-api:sha-a1b2c3d -o spdx-json > sbom.json
  ```
- **Sign images** and attach provenance (SLSA-style build attestations):
  ```bash
  cosign sign ghcr.io/nuvyaro/notes-api@sha256:…          # keyless, using the CI's OIDC identity
  cosign verify ghcr.io/nuvyaro/notes-api@sha256:… \
    --certificate-identity-regexp 'https://github.com/Nuvyaro/.*' \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com
  ```
- Deploy by **digest** (`@sha256:…`), not mutable tags.

## 4. Kubernetes security

- **Admission policies** (Kyverno, OPA Gatekeeper, or built-in ValidatingAdmissionPolicy): only signed images from your registry, no privileged pods, resource limits required, no `latest` tags.
- **Pod Security Admission** `restricted` on application namespaces; hardened `securityContext` (non-root, read-only root FS, drop capabilities) — see [Production readiness](09-kubernetes-production-readiness.md).
- **RBAC least privilege**; no cluster-admin for CI; audit logging on.
- **NetworkPolicies** default-deny — see [Networking](07-kubernetes-networking.md).
- **Runtime detection** (Falco, eBPF-based tools): alert on shells in containers, unexpected outbound connections, crypto-mining patterns.
- Keep clusters and nodes patched; upgrade Kubernetes versions regularly.

## 5. Cloud account security

- Separate accounts/projects per environment and a **separate backup account**.
- MFA everywhere; no long-lived root/admin keys; break-glass accounts monitored.
- Guardrails: organization policies (block public buckets, restrict regions), CloudTrail/audit logs to an isolated account, configuration scanning (Checkov/tfsec on Terraform — see [IaC](18-infrastructure-as-code-terraform.md)).

## 6. Preparing for security incidents

| Phase | Actions |
|-------|---------|
| Prepare | Asset inventory, SBOMs, logging retention, isolated immutable backups, contacts (legal, PR, authorities) |
| Detect | Alerts on unusual IAM activity, mass deletions, new admin users, unusual egress |
| Contain | Revoke credentials, isolate workloads/accounts, block network paths |
| Eradicate | Rebuild from trusted IaC and signed images (don't "clean" compromised hosts) |
| Recover | Restore data from immutable backups taken before the compromise |
| Learn | Postmortem; legal/regulatory notifications if required |

Rebuilding from code and restoring from immutable backups is exactly where IaC, GitOps, and the backup practices in this track pay off.

## DevSecOps checklist

- [ ] Secret scanning + push protection; no static cloud keys in CI (OIDC)
- [ ] SAST + dependency scanning with automated update PRs
- [ ] Image scanning, SBOM generation, signing; deploy by digest
- [ ] Admission policies enforce signatures and pod security
- [ ] RBAC least privilege, NetworkPolicies, audit logs
- [ ] Immutable backups in a separate account
- [ ] Security incident runbook rehearsed

## Quick check

**Q: A critical CVE is announced in a popular logging library. How do you find out within minutes whether you're affected?**

A: Query the SBOMs of all deployed images (or your registry's scanner) for the library and version, then prioritize patching the affected services through the normal pipeline.

**Q: Why rebuild compromised servers instead of cleaning them?**

A: You can't be sure every backdoor was removed. Rebuilding from trusted code and signed images, then restoring data from clean backups, guarantees a known-good state.

**Back to:** [DevOps track overview](01-containers-and-docker-basics.md) · [Disaster recovery](15-disaster-recovery-and-business-continuity.md)
