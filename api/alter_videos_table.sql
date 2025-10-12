-- Add thumbnail_url column to mom_sub_pack_videos table
ALTER TABLE mom_sub_pack_videos 
ADD COLUMN thumbnail_url VARCHAR(500) NULL AFTER video_url;

-- Add index for better performance
CREATE INDEX idx_thumbnail_url ON mom_sub_pack_videos (thumbnail_url);