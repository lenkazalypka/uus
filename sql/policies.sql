-- Включаем RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Категории: все видят
CREATE POLICY "Categories public" ON categories FOR SELECT USING (true);

-- Профили: только свои
CREATE POLICY "Profiles own" ON profiles 
FOR ALL USING (auth.uid() = id);

-- Курсы: все видят, авторы создают/редактируют свои
CREATE POLICY "Courses public read" ON courses FOR SELECT USING (true);

CREATE POLICY "Courses author create" ON courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('author', 'admin')
  )
);

CREATE POLICY "Courses author update" ON courses FOR UPDATE
USING (author_id = auth.uid());

-- Лайки и покупки: только свои
CREATE POLICY "Likes own" ON likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Purchases own" ON purchases FOR ALL USING (auth.uid() = user_id);