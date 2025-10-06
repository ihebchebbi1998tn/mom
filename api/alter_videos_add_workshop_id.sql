-- Updated: mom_sub_pack_videos table to support workshop videos
-- workshop_id and sub_pack_id can both be null now, as challenge_id is also supported

-- Refactored: challenge_videos.php now uses mom_sub_pack_videos table with challenge_id

-- First, make sub_pack_id nullable (if not already done)
ALTER TABLE mom_sub_pack_videos 
MODIFY COLUMN sub_pack_id INT NULL;

-- Add workshop_id column (if not already done)
ALTER TABLE mom_sub_pack_videos 
ADD COLUMN IF NOT EXISTS workshop_id INT NULL AFTER sub_pack_id;

-- Add challenge_id column
ALTER TABLE mom_sub_pack_videos 
ADD COLUMN IF NOT EXISTS challenge_id INT NULL AFTER workshop_id;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workshop_id ON mom_sub_pack_videos (workshop_id);
CREATE INDEX IF NOT EXISTS idx_challenge_id ON mom_sub_pack_videos (challenge_id);

-- Drop old constraint (MySQL syntax)
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

-- Add foreign keys
ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT IF NOT EXISTS fk_workshop_videos
FOREIGN KEY (workshop_id) REFERENCES mom_workshops(id) ON DELETE CASCADE;

ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT IF NOT EXISTS fk_challenge_videos
FOREIGN KEY (challenge_id) REFERENCES mom_challenges(id) ON DELETE CASCADE;
