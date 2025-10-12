-- Add banner_image_url and intro_video_url columns to mom_sub_packs table
ALTER TABLE `mom_sub_packs` 
ADD COLUMN `banner_image_url` TEXT COLLATE utf8mb4_unicode_ci AFTER `description`,
ADD COLUMN `intro_video_url` TEXT COLLATE utf8mb4_unicode_ci AFTER `banner_image_url`;
