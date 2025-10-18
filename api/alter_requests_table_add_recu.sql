-- Add recu_link column to mom_requests table for receipt upload
ALTER TABLE mom_requests 
ADD COLUMN recu_link VARCHAR(500) NULL AFTER admin_notes;

-- Add index for better performance when filtering by receipt status
CREATE INDEX idx_requests_recu_link ON mom_requests(recu_link);