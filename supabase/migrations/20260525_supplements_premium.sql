-- Premium supplements catalog: rich product fields, ratings, sections

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hero_image_url        TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images        JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_urls            JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS short_promise         TEXT,
  ADD COLUMN IF NOT EXISTS benefits              JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nutrition_facts       JSONB    DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ingredients           TEXT,
  ADD COLUMN IF NOT EXISTS allergens             TEXT[]   DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS how_to_use            JSONB    DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS warnings              TEXT,
  ADD COLUMN IF NOT EXISTS certifications        TEXT[]   DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS faq                   JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rating_average        NUMERIC(3,2) DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS rating_count          INTEGER  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured           BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_best_seller        BOOLEAN  DEFAULT FALSE;

-- Seed sample supplement products with rich data
-- Only insert if no products exist (dev environment seed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN

    -- Insert categories first (if not already present)
    INSERT INTO product_categories (name, slug, icon, description) VALUES
      ('Proteínas', 'proteinas', '💪', 'Whey, Caseína, Proteína vegetal e mais'),
      ('Creatina', 'creatina', '⚡', 'Creatina monohidratada e micronizada'),
      ('Pré-treino', 'pre-treino', '🔥', 'Energia e foco para o treino'),
      ('Aminoácidos', 'aminoacidos', '🧬', 'BCAA, Glutamina, EAA e mais'),
      ('Vitaminas', 'vitaminas', '🌿', 'Vitaminas e minerais essenciais'),
      ('Queimadores', 'queimadores', '🔆', 'Termogênicos e auxiliares'),
      ('Hipercalórico', 'hipercalorico', '📈', 'Mass gainer para ganho de massa')
    ON CONFLICT (slug) DO NOTHING;

    -- Whey Protein
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'Whey Protein Concentrado', 'whey-protein-concentrado', 'NutriForce',
      'O whey protein concentrado premium com sabor excepcional e alto teor proteico para suportar seu ganho de massa muscular.',
      'Proteína clara. Resultado consistente.',
      8990, 11990,
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80',
      '900g', 'Chocolate', 90,
      TRUE, FALSE, TRUE, TRUE,
      4.9, 1284,
      '[
        {"icon":"💪","title":"Ganho Muscular","description":"Alto teor proteico para síntese muscular eficiente"},
        {"icon":"⚡","title":"Recuperação Rápida","description":"Aminoácidos essenciais para acelerar a recuperação"},
        {"icon":"🎯","title":"Fácil Absorção","description":"Proteína de rápida digestão ideal pós-treino"},
        {"icon":"🌿","title":"Qualidade Premium","description":"Sem aromas artificiais, sem ingredientes desnecessários"}
      ]'::jsonb,
      '{
        "serving_size":"30g",
        "servings_per_container":30,
        "calories":120,
        "protein_g":24,
        "carbs_g":3,
        "fat_g":2,
        "fiber_g":0.5,
        "sodium_mg":80,
        "calcium_mg":130,
        "leucine_g":2.3,
        "isoleucine_g":1.2,
        "valine_g":1.3
      }'::jsonb,
      '{
        "dose":"1 scoop (30g)",
        "timing":"Até 30 minutos após o treino",
        "preparation":"Misture com 200-250ml de água ou leite",
        "frequency":"1-2 vezes ao dia",
        "notes":"Pode ser usado no café da manhã como complemento proteico"
      }'::jsonb,
      '[
        {"question":"Posso tomar antes de dormir?","answer":"Sim, mas o ideal é priorizar pós-treino ou no café da manhã. Para antes de dormir, prefira proteínas de digestão lenta como caseína."},
        {"question":"É indicado para iniciantes?","answer":"Sim, o whey é indicado para todos os níveis de treinamento que desejam aumentar a ingestão proteica diária."},
        {"question":"Tem glúten?","answer":"Este produto não contém glúten em sua formulação. Verifique o rótulo para informações atualizadas."},
        {"question":"Qual a diferença para o whey isolado?","answer":"O concentrado possui entre 70-80% de proteína por porção, enquanto o isolado tem 90%+. Para a maioria dos objetivos, o concentrado é uma excelente e mais econômica opção."}
      ]'::jsonb,
      ARRAY['Leite', 'Soja']::TEXT[],
      ARRAY['Certificado ANVISA', 'GMP Certified', 'Testado por Laboratório Independente']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'proteinas' LIMIT 1)
    ;

    -- Creatina Monohidratada
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'Creatina Monohidratada', 'creatina-monohidratada', 'PureLab',
      'Creatina micronizada de pureza farmacêutica. Sem sabor, sem mistura, apenas resultado puro.',
      'Força máxima em cada treino.',
      4990, 6490,
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      '300g', NULL, 50,
      TRUE, FALSE, TRUE, TRUE,
      4.8, 867,
      '[
        {"icon":"💥","title":"Força Explosiva","description":"Aumenta os estoques de fosfocreatina para sprints e levantamentos máximos"},
        {"icon":"🏋️","title":"Volume Muscular","description":"Retém água intramuscular para músculos mais volumosos e definidos"},
        {"icon":"🔄","title":"Recuperação","description":"Acelera a reposição de ATP para treinos mais intensos"},
        {"icon":"🔬","title":"Mais Estudada","description":"O suplemento com maior respaldo científico do mundo"}
      ]'::jsonb,
      '{
        "serving_size":"5g",
        "servings_per_container":60,
        "calories":0,
        "protein_g":0,
        "carbs_g":0,
        "fat_g":0,
        "creatine_g":5
      }'::jsonb,
      '{
        "dose":"1 colher (5g)",
        "timing":"Pós-treino ou a qualquer momento do dia",
        "preparation":"Misture em água, suco ou shake proteico",
        "frequency":"Diariamente, inclusive nos dias sem treino",
        "notes":"Fase de saturação opcional: 20g/dia por 5-7 dias divididos em 4 doses"
      }'::jsonb,
      '[
        {"question":"Preciso fazer fase de saturação?","answer":"Não é obrigatório. A saturação acelera os resultados em 1 semana, mas a manutenção de 5g/dia por 4 semanas chega ao mesmo nível."},
        {"question":"Retenção de líquido é normal?","answer":"Sim, a creatina causa retenção de água dentro da fibra muscular (não subcutânea). Isso é saudável e contribui para o volume muscular."},
        {"question":"Posso usar ciclando?","answer":"Não há necessidade científica de ciclar a creatina. O uso contínuo é seguro e eficaz."}
      ]'::jsonb,
      ARRAY[]::TEXT[],
      ARRAY['Certificado ANVISA', '99.99% Pureza', 'Creapure® Certified']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'creatina' LIMIT 1)
    ;

    -- Pré-treino
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'Pré-Treino Extremo', 'pre-treino-extremo', 'BlackBull',
      'Fórmula avançada com cafeína, beta-alanina e citrulina. Para quem leva o treino a sério.',
      'Seu pré-treino, sem complicação.',
      7490, 9990,
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80',
      '300g', 'Frutas Vermelhas', 75,
      TRUE, FALSE, FALSE, TRUE,
      4.7, 542,
      '[
        {"icon":"⚡","title":"Energia Intensa","description":"Cafeína + Taurina para foco e energia sem crash"},
        {"icon":"🩸","title":"Pump Máximo","description":"Citrulina malato para vasodilatação e pump incrível"},
        {"icon":"🧠","title":"Foco Mental","description":"Nootrópicos para concentração total no treino"},
        {"icon":"🔥","title":"Resistência","description":"Beta-alanina para adiar a fadiga muscular"}
      ]'::jsonb,
      '{
        "serving_size":"10g",
        "servings_per_container":30,
        "calories":35,
        "protein_g":0,
        "carbs_g":8,
        "fat_g":0,
        "caffeine_mg":200,
        "citrulline_malate_g":4,
        "beta_alanine_g":3.2,
        "taurine_mg":1000,
        "arginine_g":1.5
      }'::jsonb,
      '{
        "dose":"1 scoop (10g)",
        "timing":"20-30 minutos antes do treino",
        "preparation":"Misture em 200ml de água gelada",
        "frequency":"Apenas nos dias de treino",
        "notes":"Não use após as 18h para não interferir no sono. Comece com meia dose para testar tolerância."
      }'::jsonb,
      '[
        {"question":"Vou sentir formigamento?","answer":"A beta-alanina causa parestesia (formigamento) em algumas pessoas. É inofensivo e tende a diminuir com o uso regular."},
        {"question":"Posso tomar em jejum?","answer":"Sim, mas se o estômago for sensível, tome após um lanche leve."},
        {"question":"Tem dependência?","answer":"Não causa dependência química. A cafeína pode gerar tolerância, então dias sem uso ajudam a manter a eficácia."}
      ]'::jsonb,
      ARRAY['Soja']::TEXT[],
      ARRAY['Certificado ANVISA', 'GMP Certified']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'pre-treino' LIMIT 1)
    ;

    -- BCAA
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'BCAA 2:1:1', 'bcaa-211', 'AminoMax',
      'Aminoácidos de cadeia ramificada na proporção ideal. Recuperação e anticatabolismo em cada dose.',
      'Tudo que importa, em uma dose.',
      3990, 5490,
      'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=600&q=80',
      '300g', 'Limão', 40,
      TRUE, FALSE, FALSE, FALSE,
      4.6, 328,
      '[
        {"icon":"🛡️","title":"Anticatabólico","description":"Protege a massa muscular durante treinos intensos e restrição calórica"},
        {"icon":"🔄","title":"Recuperação","description":"Reduz a dor muscular pós-treino e acelera a recuperação"},
        {"icon":"⚡","title":"Energia","description":"Leucina ativa a síntese proteica muscular de forma direta"},
        {"icon":"🏃","title":"Performance","description":"Mantém performance em treinos longos e de alta intensidade"}
      ]'::jsonb,
      '{
        "serving_size":"10g",
        "servings_per_container":30,
        "calories":40,
        "leucine_g":5,
        "isoleucine_g":2.5,
        "valine_g":2.5
      }'::jsonb,
      '{
        "dose":"1 scoop (10g)",
        "timing":"Durante ou após o treino",
        "preparation":"Dissolva em 300-400ml de água",
        "frequency":"Nos dias de treino",
        "notes":"Pode ser combinado com whey protein para maximizar a síntese proteica"
      }'::jsonb,
      '[
        {"question":"BCAA e whey juntos fazem sentido?","answer":"Sim, especialmente se o whey não tiver perfil aminoacídico completo. O BCAA complementa muito bem o whey concentrado."},
        {"question":"Posso tomar em jejum?","answer":"Ótimo em jejum antes do treino para proteger a massa muscular durante o catabolismo do treino em jejum."}
      ]'::jsonb,
      ARRAY['Leite']::TEXT[],
      ARRAY['Certificado ANVISA', 'GMP Certified']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'aminoacidos' LIMIT 1)
    ;

    -- Whey Isolado Club Exclusive
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'Whey Isolado Premium', 'whey-isolado-premium', 'EliteNutrition',
      'O whey isolado mais puro do mercado. 90%+ de proteína por porção, zero lactose, zero gordura, máximo resultado.',
      'Proteína de elite. Resultado de elite.',
      13990, 17990,
      'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&q=80',
      '900g', 'Baunilha', 140,
      TRUE, TRUE, TRUE, FALSE,
      4.9, 421,
      '[
        {"icon":"💎","title":"Pureza Máxima","description":"90%+ de proteína por porção, processo de ultrafiltração"},
        {"icon":"🚫","title":"Zero Lactose","description":"Processo de isolamento remove lactose — ideal para intolerantes"},
        {"icon":"⚡","title":"Absorção Rápida","description":"Proteína de digestão ultra-rápida para síntese imediata"},
        {"icon":"🏆","title":"Resultado Superior","description":"Para atletas que exigem o melhor da nutrição esportiva"}
      ]'::jsonb,
      '{
        "serving_size":"30g",
        "servings_per_container":30,
        "calories":112,
        "protein_g":27,
        "carbs_g":1,
        "fat_g":0.5,
        "fiber_g":0,
        "sodium_mg":65,
        "calcium_mg":145,
        "leucine_g":2.8,
        "isoleucine_g":1.4,
        "valine_g":1.5
      }'::jsonb,
      '{
        "dose":"1 scoop (30g)",
        "timing":"Imediatamente após o treino",
        "preparation":"Misture com 200ml de água gelada",
        "frequency":"1-2 vezes ao dia",
        "notes":"Por ser um isolado ultra-puro, mistura perfeitamente sem grumos"
      }'::jsonb,
      '[
        {"question":"Vale a pena pagar mais pelo isolado?","answer":"Depende do objetivo. Para intolerantes à lactose ou quem busca máxima pureza proteica, definitivamente vale. Para a maioria, o concentrado já é excelente."},
        {"question":"Tem algum sabor artificial?","answer":"Nossa linha premium usa apenas aromatizantes naturais, sem aspartame ou sucralose."}
      ]'::jsonb,
      ARRAY['Leite']::TEXT[],
      ARRAY['Certificado ANVISA', 'Informed Sport', 'NSF Certified', 'Gluten Free']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'proteinas' LIMIT 1)
    ;

    -- Vitamina D3 + K2
    INSERT INTO products (
      name, slug, brand, description, short_promise,
      price_cents, old_price_cents, image_url,
      weight_volume, flavor, points_per_unit,
      is_active, is_club_exclusive, is_featured, is_best_seller,
      rating_average, rating_count,
      benefits, nutrition_facts, how_to_use, faq,
      allergens, certifications, category_id
    )
    SELECT
      'Vitamina D3 + K2', 'vitamina-d3-k2', 'VitaMax',
      'A combinação perfeita de D3 e K2 para ossos fortes, imunidade de ferro e saúde cardiovascular.',
      'Sua saúde começa por dentro.',
      3290, NULL,
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      '60 cápsulas', NULL, 33,
      TRUE, FALSE, FALSE, FALSE,
      4.8, 193,
      '[
        {"icon":"🦴","title":"Ossos Fortes","description":"D3 e K2 trabalham em sinergia para absorção e fixação do cálcio"},
        {"icon":"🛡️","title":"Imunidade","description":"Vitamina D essencial para função imunológica otimizada"},
        {"icon":"❤️","title":"Saúde Cardiovascular","description":"K2 direciona o cálcio para os ossos, protegendo as artérias"},
        {"icon":"😌","title":"Bem-estar","description":"Regula o humor e combate a fadiga crônica"}
      ]'::jsonb,
      '{
        "serving_size":"1 cápsula",
        "servings_per_container":60,
        "calories":5,
        "vitamin_d3_ui":2000,
        "vitamin_k2_mcg":100
      }'::jsonb,
      '{
        "dose":"1 cápsula",
        "timing":"Junto com a refeição principal",
        "preparation":"Engolir com água",
        "frequency":"Diariamente",
        "notes":"Melhor absorção com alimentos contendo gordura. Consulte médico para doses acima do recomendado."
      }'::jsonb,
      '[
        {"question":"Preciso de exame antes de tomar?","answer":"Para suplementação padrão (2000 UI/dia), não é necessário. Para doses terapêuticas acima disso, recomendamos avaliar com médico."},
        {"question":"Por que D3 com K2?","answer":"O K2 é essencial para direcionar o cálcio absorvido pela D3 para os ossos, evitando calcificação arterial."}
      ]'::jsonb,
      ARRAY[]::TEXT[],
      ARRAY['Certificado ANVISA', 'Vegetarian Friendly']::TEXT[],
      (SELECT id FROM product_categories WHERE slug = 'vitaminas' LIMIT 1)
    ;

  END IF;
END $$;
