# Reliability 2: Backup & Restore (Databases, Kubernetes, Ransomware)

> **In one sentence:** a backup only counts if you can restore it — so back up to an isolated, immutable location in another region, keep enough history to go back before any damage, and test restores regularly.

**Level:** Intermediate · **You'll learn:** the 3-2-1-1-0 rule, backup types, database point-in-time recovery, Kubernetes backups with Velero, ransomware-proof backups, and restore testing.

## See it in action

<div class="sim" data-sim="pipeline" data-title="Life of a backup" data-steps="Take backup|Verify|Copy off-site|Lock (immutable)|Expire old copies|Restore drill" data-labels="Snapshot, dump, or continuous WAL archive|Checksum + test that the archive is readable|Another region AND another account|Object Lock: nobody can delete it early|Lifecycle rules: tiering + retention|Regularly restore into a test environment and verify data"><em>Interactive animation available on the website.</em></div>

## The 3-2-1-1-0 rule

- **3** copies of your data (production + 2 backups)
- **2** different storage types/media
- **1** copy off-site (another region)
- **1** copy offline or **immutable** (can't be changed or deleted, even by admins)
- **0** errors when you test restores

## Backup types

| Type | What | Pros | Cons |
|------|------|------|------|
| **Full** | Everything, every time | Simple restore | Slow, large |
| **Incremental** | Changes since the last backup of any kind | Small, fast | Restore needs the chain |
| **Differential** | Changes since the last full | Restore = full + one differential | Grows until next full |
| **Snapshot** | Point-in-time copy of a volume/disk (copy-on-write) | Very fast | Same failure domain unless copied out; crash-consistent only |
| **Logical** (`pg_dump`, `mysqldump`) | SQL/data export | Portable across versions; restore single tables | Slow for big databases |
| **Continuous / PITR** | Base backup + continuous transaction log (WAL/binlog) archive | Restore to **any second** | More setup |

## Database backups

**Point-in-time recovery (PITR)** is the standard for production databases: a nightly base backup plus continuously archived transaction logs lets you restore to, say, *14:31:59*, one second before someone ran `DELETE FROM orders` without a `WHERE`.

- Managed databases (RDS, Cloud SQL, Azure SQL) provide automated backups and PITR — enable them, set retention (e.g., 35 days), and **copy snapshots to another region/account**.
- Self-managed PostgreSQL: tools like pgBackRest, WAL-G, or Barman archive WAL to object storage.
- A simple logical backup as a Kubernetes CronJob is in [`examples/reliability/k8s/postgres-backup-cronjob.yaml`](examples/reliability/k8s/postgres-backup-cronjob.yaml) — note `concurrencyPolicy: Forbid`, a deadline, and a sanity check (`pg_restore --list`) before upload.

## Kubernetes backups with Velero

Your cluster state (Deployments, ConfigMaps, Secrets, PVCs) also needs backups — or better, it lives in git (GitOps) and only **persistent volumes** need backing up. **Velero** backs up Kubernetes objects and volume snapshots to object storage and restores them into the same or a new cluster:

```yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: notes-prod-every-6h
  namespace: velero
spec:
  schedule: "0 */6 * * *"
  template:
    includedNamespaces: [notes-prod]
    snapshotVolumes: true
    storageLocation: dr-region      # a bucket in another region
    ttl: 720h0m0s                   # 30 days
```

([full file](examples/reliability/k8s/velero-schedule.yaml) — validated against the Velero CRD schemas.)

```bash
velero backup create before-upgrade --include-namespaces notes-prod --wait
velero backup describe before-upgrade
velero restore create --from-backup before-upgrade      # into a new cluster after a disaster
```

## Ransomware-resistant backups

Attackers with admin credentials target backups first. Defenses:
1. **Immutability:** S3 Object Lock in *compliance* mode (or equivalent) — locked versions can't be deleted before the retention date, even by the root account. The [Terraform example](examples/reliability/terraform/backups.tf) enables versioning + Object Lock and replicates to the DR region **without replicating deletes**.
2. **Isolation:** backups in a **separate cloud account** with separate credentials; production roles can write but not delete.
3. **Air gap / offline copies** for the most critical data.
4. **Retention long enough** to go back before the infection started (attackers may lurk for weeks).
5. **Alert on anomalies:** sudden mass deletions, backup jobs failing, encryption-like write patterns.

## Test your restores

- Automate a **weekly restore** into an isolated environment: restore, run integrity checks (row counts, checksums, app smoke tests), report the time taken (your real RTO for that data).
- Alert when backups are missing or old — the [Prometheus rule example](examples/reliability/k8s/prometheus-rules.yaml) pages if no successful backup happened in 26 hours.
- Practice restoring **a single record/table** too — the most common real request.

## Backup checklist

- [ ] Every stateful system listed with owner, RPO, retention
- [ ] PITR enabled for databases
- [ ] Backups copied to another region **and** another account
- [ ] Object Lock / immutability on backup storage
- [ ] Encryption with keys you can still access during a disaster (replicate KMS keys)
- [ ] Monitoring for missing/failed backups
- [ ] Automated restore tests with recorded duration
- [ ] Documented restore runbooks

## Quick check

**Q: An engineer accidentally deleted 10,000 rows at 14:32. The last nightly backup is from 02:00. How do you recover without losing the morning's data?**

A: Point-in-time recovery: restore the 02:00 base backup and replay the archived transaction logs up to 14:31:59 into a new instance, then copy the deleted rows back (or switch over) — losing nothing.

**Q: Why should deletes not be replicated to the DR backup bucket?**

A: If an attacker or a mistake deletes backups in the primary bucket, replicating the delete would destroy the DR copy too. Keeping deletes local preserves a safe copy.

**Next:** [Multi-region & high availability](17-multi-region-high-availability.md)
