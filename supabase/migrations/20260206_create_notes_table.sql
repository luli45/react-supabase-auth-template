-- Create notes table for mobile app
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_width INTEGER NOT NULL DEFAULT 1080,
  canvas_height INTEGER NOT NULL DEFAULT 1920,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own notes
CREATE POLICY "Users can view their own notes"
  ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own notes
CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
