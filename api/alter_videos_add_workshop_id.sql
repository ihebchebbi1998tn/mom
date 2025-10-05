-- Add workshop_id column to mom_sub_pack_videos table to support both sub-pack and workshop videos
-- When workshop_id is filled, sub_pack_id should be null (workshop video)
-- When workshop_id is null, sub_pack_id should be filled (sub-pack video)

-- First, make sub_pack_id nullable
ALTER TABLE mom_sub_pack_videos 
MODIFY COLUMN sub_pack_id INT NULL;

-- Add workshop_id column
ALTER TABLE mom_sub_pack_videos 
ADD COLUMN workshop_id INT NULL AFTER sub_pack_id;

-- Add index for workshop_id
CREATE INDEX idx_workshop_id ON mom_sub_pack_videos (workshop_id);

-- Add a check constraint to ensure either sub_pack_id OR workshop_id is filled (not both, not neither)
ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT chk_video_parent 
CHECK (
  (sub_pack_id IS NOT NULL AND workshop_id IS NULL) OR 
  (sub_pack_id IS NULL AND workshop_id IS NOT NULL)
);

-- Add foreign key for workshop_id
ALTER TABLE mom_sub_pack_videos
ADD CONSTRAINT fk_workshop_videos
FOREIGN KEY (workshop_id) REFERENCES mom_workshops(id) ON DELETE CASCADE;
