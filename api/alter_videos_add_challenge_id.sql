-- Add challenge_id column to mom_sub_pack_videos table to support challenge videos
-- Videos can now belong to: sub_pack_id, workshop_id, OR challenge_id (exactly one, not multiple)

-- Add challenge_id column
ALTER TABLE mom_sub_pack_videos 
ADD COLUMN challenge_id INT NULL AFTER workshop_id;

-- Add index for challenge_id
CREATE INDEX idx_challenge_id ON mom_sub_pack_videos (challenge_id);

-- Drop the old constraint (MySQL syntax)
ALTER TABLE mom_sub_pack_videos
DROP CHECK chk_video_parent;

-- Add updated check constraint to ensure exactly ONE of sub_pack_id, workshop_id, OR challenge_id is filled
ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT chk_video_parent 
CHECK (
  (sub_pack_id IS NOT NULL AND workshop_id IS NULL AND challenge_id IS NULL) OR 
  (sub_pack_id IS NULL AND workshop_id IS NOT NULL AND challenge_id IS NULL) OR
  (sub_pack_id IS NULL AND workshop_id IS NULL AND challenge_id IS NOT NULL)
);

-- Add foreign key for challenge_id
ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT fk_challenge_videos
FOREIGN KEY (challenge_id) REFERENCES mom_challenges(id) ON DELETE CASCADE;

-- Migrate data from mom_challenge_videos to mom_sub_pack_videos (if the old table exists)
INSERT INTO mom_sub_pack_videos (challenge_id, title, description, video_url, thumbnail_url, duration, order_index, status, created_at, updated_at)
SELECT challenge_id, title, description, video_url, thumbnail_url, duration, order_index, status, created_at, updated_at
FROM mom_challenge_videos
WHERE NOT EXISTS (
  SELECT 1 FROM mom_sub_pack_videos WHERE mom_sub_pack_videos.id = mom_challenge_videos.id
);

-- After migration is complete and verified, you can drop the old table:
-- DROP TABLE mom_challenge_videos;
