# Challenge Video Migration to Unified Videos Table

## Overview
This migration consolidates challenge videos into the `mom_sub_pack_videos` table, allowing videos to belong to sub-packs, workshops, OR challenges using a single unified table structure.

## Database Changes

### New Column Added
- **challenge_id**: INT NULL (added after workshop_id)
- Foreign key constraint to `mom_challenges(id)` with CASCADE delete
- Index added for performance

### Updated Check Constraint
The `chk_video_parent` constraint now ensures exactly ONE of the following is filled:
- `sub_pack_id` (sub-pack video)
- `workshop_id` (workshop video)  
- `challenge_id` (challenge video)

## Migration Steps

### 1. Run SQL Migration
Execute: `api/alter_videos_add_challenge_id.sql`

This will:
- Add `challenge_id` column
- Update check constraints
- Add foreign key and index
- Migrate existing data from `mom_challenge_videos` (if table exists)

### 2. API Changes

#### Updated APIs:
- **api/videos.php**: 
  - Added `getVideosByChallengeId()` function
  - Updated all queries to include `challenge_id` in JOINs and WHERE clauses
  - Updated validation to accept challenge_id in addition to sub_pack_id and workshop_id
  - All INSERT/UPDATE operations now support challenge_id

- **api/challenge_videos.php**: 
  - Refactored to use `mom_sub_pack_videos` table instead of `mom_challenge_videos`
  - All queries now filter by `challenge_id IS NOT NULL`
  - Maintains backward compatibility with existing API endpoints

- **api/workshop_videos.php**: 
  - Updated queries to ensure `challenge_id IS NULL` for workshop videos

### 3. Frontend Changes Needed
Update any TypeScript code that:
- Fetches challenge videos (should continue working with existing endpoints)
- Creates/updates challenge videos (no changes needed)
- References `mom_challenge_videos` table directly (rare)

## API Endpoints

### Get Videos by Challenge
```
GET /api/videos.php?challenge_id={id}
GET /api/videos.php?challenge_id={id}&user_access=true
```

### Get Videos by Challenge (Legacy)
```
GET /api/challenge_videos.php?challenge_id={id}
GET /api/challenge_videos.php?challenge_id={id}&user_access=true
```

Both endpoints work identically after migration.

## Benefits
1. **Unified structure**: All video types in one table
2. **Simplified queries**: No need for UNION queries across multiple tables
3. **Consistent API**: Same patterns for sub-packs, workshops, and challenges
4. **Better performance**: Single table with proper indexes
5. **Easier maintenance**: One schema to manage

## Rollback Plan
If needed, the old `mom_challenge_videos` table is not dropped automatically. To rollback:
1. Stop using the new endpoints
2. Migrate data back to `mom_challenge_videos`
3. Drop the `challenge_id` column and restore old constraint

## Testing Checklist
- [ ] Run SQL migration successfully
- [ ] Verify challenge videos display correctly
- [ ] Test creating new challenge videos
- [ ] Test updating challenge videos
- [ ] Test deleting challenge videos
- [ ] Verify user access filtering works
- [ ] Confirm workshop and sub-pack videos still work
- [ ] Check admin dashboard displays all video types
