# Pack-Workshop and Pack-Challenge Links Setup

This guide explains how to link workshops and challenges to packs, creating many-to-many relationships.

## Database Migration

Run this SQL to create the junction tables:

```sql
-- Execute the file: create_pack_workshop_challenge_links.sql
```

## API Endpoints

### Pack-Workshop Links API (`pack_workshop_links.php`)

#### GET - Get workshops linked to a pack
```
GET /api/pack_workshop_links.php?pack_id=1
```
Returns all workshops linked to the specified pack.

#### POST - Link a workshop to a pack
```json
POST /api/pack_workshop_links.php
{
  "pack_id": 1,
  "workshop_id": 2,
  "order_index": 0
}
```

#### DELETE - Unlink a workshop from a pack
```
DELETE /api/pack_workshop_links.php?pack_id=1&workshop_id=2
```

#### PUT - Update order of workshops
```json
PUT /api/pack_workshop_links.php
{
  "links": [
    {"pack_id": 1, "workshop_id": 2, "order_index": 0},
    {"pack_id": 1, "workshop_id": 3, "order_index": 1}
  ]
}
```

### Pack-Challenge Links API (`pack_challenge_links.php`)

#### GET - Get challenges linked to a pack
```
GET /api/pack_challenge_links.php?pack_id=1
```
Returns all challenges linked to the specified pack.

#### POST - Link a challenge to a pack
```json
POST /api/pack_challenge_links.php
{
  "pack_id": 1,
  "challenge_id": 2,
  "order_index": 0
}
```

#### DELETE - Unlink a challenge from a pack
```
DELETE /api/pack_challenge_links.php?pack_id=1&challenge_id=2
```

#### PUT - Update order of challenges
```json
PUT /api/pack_challenge_links.php
{
  "links": [
    {"pack_id": 1, "challenge_id": 2, "order_index": 0},
    {"pack_id": 1, "challenge_id": 3, "order_index": 1}
  ]
}
```

## Benefits

- **Flexibility**: One workshop can be part of multiple packs
- **Reusability**: Challenges can be reused across different packs
- **Easy Management**: Simple API to add/remove/reorder links
- **No Data Duplication**: Workshops and challenges are stored once and linked multiple times

## Next Steps

To enable admin UI management:
1. Create modal components similar to `PackSubPackLinksModal`
2. Add buttons in `CoursePacksManagement` to manage workshop and challenge links
3. Display linked workshops/challenges in pack detail views
