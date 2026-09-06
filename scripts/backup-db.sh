#!/bin/bash
# BASA Database Backup Script
# Runs daily via cron to backup PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/opt/basa-app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="basa_db_backup_${TIMESTAMP}.sql.gz"
RETAIN_DAYS=7

# Load environment variables
source /opt/basa-app/.env.production

echo "[$(date)] Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Dump database and compress
docker exec basa-postgres-prod pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "[$(date)] Backup created successfully: $BACKUP_FILE"
    BACKUP_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_FILE" | awk '{print $5}')
    echo "[$(date)] Backup size: $BACKUP_SIZE"
else
    echo "[$(date)] ERROR: Backup failed or file is empty"
    exit 1
fi

# Remove backups older than RETAIN_DAYS
echo "[$(date)] Cleaning up backups older than $RETAIN_DAYS days..."
find "$BACKUP_DIR" -name "basa_db_backup_*.sql.gz" -type f -mtime +$RETAIN_DAYS -delete

# List remaining backups
echo "[$(date)] Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"

echo "[$(date)] Backup complete!"
