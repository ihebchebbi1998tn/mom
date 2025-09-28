-- Add max_reservations column to consultation_availability table
ALTER TABLE `consultation_availability` 
ADD COLUMN `max_reservations` int(11) NOT NULL DEFAULT 3 AFTER `status`;