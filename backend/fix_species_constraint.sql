-- Fix the animals_species_check constraint to include BIRD
-- Run this against your Render PostgreSQL database

-- First, drop the existing constraint
ALTER TABLE animals DROP CONSTRAINT IF EXISTS animals_species_check;

-- Then create a new constraint that includes BIRD
ALTER TABLE animals ADD CONSTRAINT animals_species_check 
CHECK (species IN ('DOG', 'CAT', 'BIRD', 'OTHER'));

-- Verify the constraint was created
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'animals_species_check'; 