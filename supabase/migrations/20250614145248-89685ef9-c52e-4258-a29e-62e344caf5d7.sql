
-- Elimina le policy esistenti, se presenti
DROP POLICY IF EXISTS "Users can insert their own words" ON public.words;
DROP POLICY IF EXISTS "Users can select their own words" ON public.words;
DROP POLICY IF EXISTS "Users can update their own words" ON public.words;
DROP POLICY IF EXISTS "Users can delete their own words" ON public.words;

-- RLS ON (se non già attivo)
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Crea policy pulite e chiare per ogni operazione
CREATE POLICY "Users can insert their own words"
  ON public.words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own words"
  ON public.words
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
  ON public.words
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
  ON public.words
  FOR DELETE
  USING (auth.uid() = user_id);
