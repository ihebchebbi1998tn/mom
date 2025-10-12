-- Add intro_video_url column to mom_packs table
ALTER TABLE `mom_packs` 
ADD COLUMN `intro_video_url` TEXT COLLATE utf8mb4_unicode_ci AFTER `image_url`;
