# Pack-SubPack Many-to-Many Migration Guide

## Overview
This migration converts the pack-subpack relationship from one-to-many to many-to-many, allowing sub_packs to be reused across multiple packs.

## Migration Steps

### 1. Create the Junction Table
Run the SQL migration file to create the junction table:
```bash
mysql -u your_user -p your_database < api/create_pack_subpack_links_table.sql
```

### 2. Populate the Junction Table
Run the data migration script to populate the junction table based on existing relationships:
```bash
php api/migrate_pack_subpack_data.php
```
Or access via browser:
```
https://your-domain.com/mom/api/migrate_pack_subpack_data.php
```

### 3. Verify the Migration
Check that the junction table has been populated correctly:
```sql
SELECT 
    p.title as pack,
    sp.title as sub_pack,
    l.order_index
FROM mom_pack_sub_pack_links l
JOIN mom_packs p ON l.pack_id = p.id
JOIN mom_sub_packs sp ON l.sub_pack_id = sp.id
ORDER BY l.pack_id, l.order_index;
```

## New API Endpoints

### Get Sub-Packs for a Pack
```
GET /api/pack_sub_pack_links.php?pack_id=1
```

### Get Packs containing a Sub-Pack
```
GET /api/pack_sub_pack_links.php?sub_pack_id=1
```

### Link a Sub-Pack to a Pack
```
POST /api/pack_sub_pack_links.php
{
  "pack_id": 1,
  "sub_pack_id": 5,
  "order_index": 3
}
```

### Remove a Sub-Pack from a Pack
```
DELETE /api/pack_sub_pack_links.php
{
  "pack_id": 1,
  "sub_pack_id": 5
}
```

### Update Link Order
```
PUT /api/pack_sub_pack_links.php
{
  "id": 1,
  "order_index": 2
}
```

## Benefits
- ✅ Sub-packs can be reused across multiple packs
- ✅ No need to duplicate sub-pack content
- ✅ Independent ordering for each pack
- ✅ Easier content management
- ✅ Maintains data integrity with foreign keys

## Optional: Remove Legacy pack_id Column
After verifying everything works correctly, you can optionally remove the `pack_id` column from `mom_sub_packs`:
```sql
-- ONLY RUN THIS AFTER VERIFYING EVERYTHING WORKS
ALTER TABLE mom_sub_packs DROP FOREIGN KEY mom_sub_packs_ibfk_1;
ALTER TABLE mom_sub_packs DROP COLUMN pack_id;
```

## Rollback
If you need to rollback:
```sql
DROP TABLE mom_pack_sub_pack_links;
```
