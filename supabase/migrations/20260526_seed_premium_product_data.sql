-- Seed all products with rich premium data (benefits, nutrition_facts, how_to_use, faq, certifications)
-- These columns were added in add_premium_product_fields migration (applied via MCP)
-- This migration idempotently populates data for all existing products

-- Creatina Monohidratada Pura
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Pureza absoluta. Forca real.'),
  is_featured = TRUE,
  is_best_seller = TRUE,
  rating_average = 4.9,
  rating_count = 1247,
  ingredients = COALESCE(ingredients, 'Creatina Monohidratada (Creapure). Nao contem gluten, lactose, corantes ou conservantes.'),
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  warnings = COALESCE(warnings, 'Manter fora do alcance de criancas. Nao exceder a dose diaria recomendada.'),
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','99.9% Pureza Farmaceutica','GMP Certified','Testado em Lab Independente'] ELSE certifications END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💥","title":"Forca Explosiva","description":"Maximiza os estoques de fosfocreatina para levantamentos maximos e sprints"},
    {"icon":"🏋️","title":"Volume Muscular","description":"Aumenta o volume intracelular dos musculos para aparencia mais volumosa e definida"},
    {"icon":"🔄","title":"Recuperacao Acelerada","description":"Repoe ATP mais rapido para treinos mais intensos e mais frequentes"},
    {"icon":"🔬","title":"Ciencia Comprovada","description":"O suplemento mais estudado do mundo com decadas de evidencia cientifica solida"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"5g (1 colher medidora)","servings_per_container":60,"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"creatine_g":5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 colher medidora (5g)","timing":"Pos-treino ou a qualquer momento do dia","preparation":"Dissolva em 200ml de agua, suco ou shake proteico","frequency":"Todos os dias, inclusive nos dias sem treino","notes":"Fase de saturacao opcional: 20g/dia por 5 a 7 dias divididos em 4 doses."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Preciso fazer fase de saturacao?","answer":"Nao e obrigatorio. Com 5g/dia voce atinge a saturacao muscular em aproximadamente 4 semanas."},
    {"question":"A creatina causa retencao de liquido?","answer":"Causa retencao de agua intracelular (dentro da fibra muscular), o que e positivo e contribui para o volume muscular."},
    {"question":"Posso usar continuamente?","answer":"Sim. Estudos de ate 5 anos mostram seguranca no uso continuo. Nao ha necessidade cientifica de ciclar."},
    {"question":"Qual a diferenca para outras creatinas?","answer":"Usamos materia-prima de grau farmaceutico, sem aditivos, aromas ou adocantes. Apenas creatina pura na dose correta."}
  ]'::jsonb ELSE faq END
WHERE slug = 'creatina-monohidratada-pura';

-- Whey Protein Concentrado 900g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Proteina clara. Resultado consistente.'),
  is_featured = TRUE, is_best_seller = TRUE,
  rating_average = 4.9, rating_count = 1284,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified','Testado por Laboratorio Independente'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💪","title":"Ganho Muscular","description":"Alto teor proteico para sintese muscular eficiente e ganho de massa"},
    {"icon":"⚡","title":"Recuperacao Rapida","description":"Aminoacidos essenciais para acelerar a recuperacao pos-treino"},
    {"icon":"🎯","title":"Facil Absorcao","description":"Proteina de rapida digestao ideal para o periodo pos-treino"},
    {"icon":"🌿","title":"Qualidade Premium","description":"Sem aromas artificiais, sem ingredientes desnecessarios"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"30g","servings_per_container":30,"calories":120,"protein_g":24,"carbs_g":3,"fat_g":2,"fiber_g":0.5,"sodium_mg":80,"calcium_mg":130}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (30g)","timing":"Ate 30 minutos apos o treino","preparation":"Misture com 200 a 250ml de agua ou leite","frequency":"1 a 2 vezes ao dia","notes":"Pode ser usado no cafe da manha como complemento proteico."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Posso tomar antes de dormir?","answer":"Sim, mas o ideal e priorizar pos-treino ou no cafe da manha. Para antes de dormir, prefira caseina."},
    {"question":"E indicado para iniciantes?","answer":"Sim, o whey e indicado para todos os niveis de treinamento que desejam aumentar a ingestao proteica diaria."},
    {"question":"Qual a diferenca para o isolado?","answer":"O concentrado possui entre 70 e 80 por cento de proteina por porcao, enquanto o isolado tem 90 por cento. Para a maioria dos objetivos, o concentrado e mais economico e eficaz."}
  ]'::jsonb ELSE faq END
WHERE slug = 'whey-protein-concentrado-900g';

-- Whey Protein Isolate 900g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Proteina pura. Sem lactose. Sem desculpas.'),
  is_featured = TRUE, is_best_seller = FALSE,
  rating_average = 4.8, rating_count = 523,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified','NSF Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💎","title":"Pureza Maxima","description":"90 por cento de proteina por porcao via processo de ultrafiltracao avancado"},
    {"icon":"🚫","title":"Zero Lactose","description":"Processo de isolamento remove totalmente a lactose, ideal para intolerantes"},
    {"icon":"⚡","title":"Absorcao Rapida","description":"Proteina de digestao ultra-rapida para sintese muscular imediata pos-treino"},
    {"icon":"🏆","title":"Resultado Superior","description":"Para atletas que exigem o maximo em qualidade de nutricao esportiva"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"30g","servings_per_container":30,"calories":112,"protein_g":27,"carbs_g":1,"fat_g":0.5,"sodium_mg":65,"calcium_mg":145}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (30g)","timing":"Imediatamente apos o treino","preparation":"Misture em 200ml de agua gelada ou leite desnatado","frequency":"1 a 2 vezes ao dia","notes":"Por ser isolado puro, dissolve facilmente. Pode ser usado como base para receitas proteicas."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Vale a pena pagar mais pelo isolado?","answer":"Para intolerantes a lactose ou quem busca maxima pureza proteica, definitivamente vale. Para a maioria dos objetivos, o concentrado ja e excelente e mais economico."},
    {"question":"Tem sabor artificial?","answer":"Usamos apenas aromatizantes naturais, sem aspartame ou sucralose em excesso. O sabor e suave e agradavel."},
    {"question":"Posso tomar antes de dormir?","answer":"Funciona melhor pos-treino ou pela manha. Para antes de dormir, prefira proteinas de digestao lenta como caseina."}
  ]'::jsonb ELSE faq END
WHERE slug = 'whey-protein-isolate-900g';

-- Whey Protein Hidrolisado 900g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Proteina pre-digerida. Absorcao instantanea.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 312,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"⚡","title":"Absorcao Instantanea","description":"Peptideos pre-digeridos chegam aos musculos em minutos apos a ingestao"},
    {"icon":"🔬","title":"Alta Biodisponibilidade","description":"Maior taxa de utilizacao proteica comparado ao concentrado e isolado"},
    {"icon":"💪","title":"Anticatabólico","description":"Bloqueia o catabolismo muscular rapidamente no pos-treino imediato"},
    {"icon":"🏃","title":"Ideal para Atletas","description":"Escolha de atletas profissionais que nao podem esperar pela recuperacao"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"30g","servings_per_container":30,"calories":115,"protein_g":26,"carbs_g":1.5,"fat_g":0.5,"sodium_mg":70}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (30g)","timing":"Imediatamente apos o treino, preferencialmente em ate 15 minutos","preparation":"Misture em 200ml de agua gelada","frequency":"1 vez ao dia pos-treino","notes":"O sabor levemente amargo e caracteristica natural da hidrolise. Misturar com suco de fruta natural minimiza esse sabor."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Por que e mais amargo?","answer":"A hidrolise quebra as proteinas em peptideos menores que naturalmente tem sabor amargo. E normal e indica qualidade do produto."},
    {"question":"Qual a vantagem sobre o isolado?","answer":"A velocidade de absorcao e superior. Para janelas anabolicas imediatas pos-treino, o hidrolisado e a melhor opcao."},
    {"question":"Intolerantes a lactose podem usar?","answer":"Sim. O processo de hidrolise remove a lactose residual."}
  ]'::jsonb ELSE faq END
WHERE slug = 'whey-protein-hidrolisado-900g';

-- Caseina Micelar 900g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Proteina noturna. Musculos trabalhando enquanto voce dorme.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 287,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🌙","title":"Proteina Lenta","description":"Liberacao gradual de aminoacidos por ate 8 horas durante o sono"},
    {"icon":"🛡️","title":"Anticatabólico Noturno","description":"Protege a massa muscular durante o jejum do sono"},
    {"icon":"🏋️","title":"Recuperacao Completa","description":"Fornece todos os aminoacidos essenciais para a recuperacao muscular"},
    {"icon":"😴","title":"Auxilia o Sono","description":"Rica em triptofano, precursor da serotonina e melatonina"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"30g","servings_per_container":30,"calories":115,"protein_g":24,"carbs_g":4,"fat_g":1.5,"sodium_mg":130,"calcium_mg":280}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (30g)","timing":"30 minutos antes de dormir","preparation":"Misture em 200 a 250ml de agua ou leite. A textura e mais espessa, similar a um pudim.","frequency":"Diariamente antes de dormir","notes":"Pode ser usada para preparar pudins, mousses e outras sobremesas proteicas."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Posso usar durante o dia tambem?","answer":"Sim, mas por ser de absorcao lenta, e mais adequada para periodos sem treino ou antes de dormir."},
    {"question":"A textura grumosa e normal?","answer":"Sim, a caseina micelar forma um gel ao entrar em contato com liquidos. Isso e o que garante a liberacao lenta de aminoacidos."},
    {"question":"Posso tomar pos-treino?","answer":"Pode, mas e menos eficiente que o whey nesse contexto. Combine: whey pos-treino e caseina antes de dormir para resultados otimos."}
  ]'::jsonb ELSE faq END
WHERE slug = 'caseina-micelar-900g';

-- Creatina Monohidratada 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Forca maxima em cada treino.'),
  is_featured = TRUE, is_best_seller = TRUE,
  rating_average = 4.8, rating_count = 892,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','99.9% Pureza','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💥","title":"Forca Explosiva","description":"Aumenta os estoques de fosfocreatina para sprints e levantamentos maximos"},
    {"icon":"🏋️","title":"Volume Muscular","description":"Retencao de agua intramuscular para musculos mais volumosos"},
    {"icon":"🔄","title":"Recuperacao","description":"Acelera a reposicao de ATP para treinos mais intensos"},
    {"icon":"🔬","title":"Mais Estudada","description":"O suplemento com maior respaldo cientifico do mundo"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"5g (1 colher)","servings_per_container":60,"calories":0,"creatine_g":5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 colher (5g)","timing":"Pos-treino ou a qualquer momento do dia","preparation":"Misture em agua, suco ou shake proteico","frequency":"Diariamente, inclusive nos dias sem treino","notes":"Fase de saturacao opcional: 20g/dia por 5 a 7 dias divididos em 4 doses"}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Preciso fazer fase de saturacao?","answer":"Nao e obrigatorio. A saturacao acelera os resultados em 1 semana, mas a manutencao de 5g/dia por 4 semanas chega ao mesmo nivel."},
    {"question":"Retencao de liquido e normal?","answer":"Sim, a creatina causa retencao de agua dentro da fibra muscular. Isso e saudavel e contribui para o volume muscular."},
    {"question":"Posso usar ciclando?","answer":"Nao ha necessidade cientifica de ciclar a creatina. O uso continuo e seguro e eficaz."}
  ]'::jsonb ELSE faq END
WHERE slug = 'creatina-monohidratada-300g';

-- Creatina HCL 120g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Creatina sem retencao. Performance sem comprometimentos.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 156,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💧","title":"Sem Retencao","description":"HCL e mais solavel, causando menos retencao de agua que a monohidratada"},
    {"icon":"📏","title":"Dose Menor","description":"3g de HCL equivalem a 5g de creatina monohidratada pela maior biodisponibilidade"},
    {"icon":"🎯","title":"Alta Solubilidade","description":"Dissolve completamente em agua sem residuos ou sedimentos"},
    {"icon":"⚡","title":"Absorcao Rapida","description":"Chega aos musculos mais rapido pelo pH acido que facilita a absorcao intestinal"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"3g","servings_per_container":40,"calories":0,"creatine_g":3}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"3g (1 colher medidora)","timing":"Pos-treino ou pre-treino","preparation":"Dissolva em 100 a 150ml de agua","frequency":"Diariamente","notes":"Por ter maior biodisponibilidade, a dose e menor que a monohidratada. Nao e necessaria fase de saturacao."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"HCL e melhor que monohidratada?","answer":"Para quem sente desconforto gastrointestinal com monohidratada ou quer evitar retencao de agua subcutanea, o HCL e uma excelente alternativa."},
    {"question":"Precisa de fase de saturacao?","answer":"Nao. Pela alta biodisponibilidade, o HCL satura os musculos mais rapidamente sem necessidade de fase de carga."},
    {"question":"Posso misturar com outros suplementos?","answer":"Sim, combina bem com pre-treino, whey e BCAA sem interacoes negativas."}
  ]'::jsonb ELSE faq END
WHERE slug = 'creatina-hcl-120g';

-- Pre-treino Assault 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Energia total. Sem crash. Treino devastador.'),
  is_featured = TRUE, is_best_seller = TRUE,
  rating_average = 4.7, rating_count = 678,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"⚡","title":"Energia Intensa","description":"Cafeina mais Taurina para foco e energia sem crash no final do treino"},
    {"icon":"🩸","title":"Pump Maximo","description":"Citrulina malato para vasodilatacao e pump incrivel durante o treino"},
    {"icon":"🧠","title":"Foco Mental","description":"Formula com nootropicos para concentracao total no treino"},
    {"icon":"🔥","title":"Resistencia","description":"Beta-alanina para adiar a fadiga muscular e treinar por mais tempo"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"10g","servings_per_container":30,"calories":35,"carbs_g":8,"caffeine_mg":200,"citrulline_malate_g":4,"beta_alanine_g":3.2,"taurine_mg":1000}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (10g)","timing":"20 a 30 minutos antes do treino","preparation":"Misture em 200ml de agua gelada e agite bem","frequency":"Apenas nos dias de treino","notes":"Nao use apos as 18h para nao interferir no sono. Comece com meia dose para testar tolerancia."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Vou sentir formigamento?","answer":"A beta-alanina causa parestesia (formigamento) em algumas pessoas. E inofensivo e tende a diminuir com o uso regular."},
    {"question":"Posso tomar em jejum?","answer":"Sim, mas se o estomago for sensivel, tome apos um lanche leve para evitar desconforto gastrico."},
    {"question":"Tem dependencia?","answer":"Nao causa dependencia quimica. A cafeina pode gerar tolerancia, entao dias sem uso ajudam a manter a eficacia."}
  ]'::jsonb ELSE faq END
WHERE slug = 'pre-treino-assault-300g';

-- Pre-treino Black Label 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Pre-treino sem limites para quem nao tem limites.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 231,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🖤","title":"Formula Extrema","description":"Dose maxima de ativos para atletas com alta tolerancia a estimulantes"},
    {"icon":"⚡","title":"300mg de Cafeina","description":"Energia brutal e duradoura para treinos de alta intensidade"},
    {"icon":"🩸","title":"Pump Intenso","description":"8g de citrulina malato para vasodilatacao extrema e pump intenso"},
    {"icon":"🔥","title":"Termogenico Integrado","description":"Extrato de cha verde acelera o metabolismo durante o treino"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"15g","servings_per_container":20,"calories":40,"carbs_g":9,"caffeine_mg":300,"citrulline_malate_g":8,"beta_alanine_g":4}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (15g)","timing":"30 minutos antes do treino","preparation":"Misture em 250ml de agua gelada","frequency":"Apenas nos dias de treino intenso","notes":"APENAS PARA USUARIOS COM ALTA TOLERANCIA A CAFEINA. Nao tome mais de 1 dose por dia."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Para iniciantes?","answer":"Nao recomendado para iniciantes ou pessoas sensiveis a cafeina. Comece com pre-treinos de menor dosagem."},
    {"question":"Posso tomar com outra fonte de cafeina?","answer":"Nao recomendado. Ja contem a dose maxima segura de cafeina. Evite cafe e outros estimulantes no mesmo dia."},
    {"question":"Por que sinto muito formigamento?","answer":"A dose elevada de beta-alanina (4g) causa parestesia intensa. E temporario e inofensivo."}
  ]'::jsonb ELSE faq END
WHERE slug = 'pre-treino-black-label-300g';

-- BCAA 2:1:1 210g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Tudo que importa. Em uma dose.'),
  is_featured = TRUE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 445,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🛡️","title":"Anticatabólico","description":"Protege a massa muscular durante treinos intensos e restricao calorica"},
    {"icon":"🔄","title":"Recuperacao","description":"Reduz a dor muscular pos-treino e acelera a recuperacao entre sessoes"},
    {"icon":"⚡","title":"Energia","description":"Leucina ativa a sintese proteica muscular de forma direta e eficiente"},
    {"icon":"🏃","title":"Performance","description":"Mantem performance em treinos longos e de alta intensidade"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"10g","servings_per_container":21,"calories":40,"leucine_g":5,"isoleucine_g":2.5,"valine_g":2.5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (10g)","timing":"Durante ou apos o treino","preparation":"Dissolva em 300 a 400ml de agua","frequency":"Nos dias de treino","notes":"Pode ser combinado com whey protein para maximizar a sintese proteica."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"BCAA e whey juntos fazem sentido?","answer":"Sim, especialmente se o whey nao tiver perfil aminoacido completo. O BCAA complementa muito bem o whey concentrado."},
    {"question":"Posso tomar em jejum?","answer":"Otimo em jejum antes do treino para proteger a massa muscular durante o catabolismo."},
    {"question":"BCAA ou EAA?","answer":"EAA contem todos os 9 aminoacidos essenciais, incluindo BCAA. Para quem nao consome proteina suficiente, EAA e mais completo."}
  ]'::jsonb ELSE faq END
WHERE slug = 'bcaa-211-210g';

-- Glutamina 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Recuperacao total. Imunidade forte. Intestino saudavel.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.5, rating_count = 198,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🛡️","title":"Imunidade","description":"Principal combustivel das celulas imunologicas, protegendo o organismo"},
    {"icon":"🔄","title":"Recuperacao Muscular","description":"Reduz o catabolismo pos-treino e acelera a sintese de glicogenio"},
    {"icon":"🌿","title":"Saude Intestinal","description":"Mantem a integridade da mucosa intestinal, essencial para absorcao de nutrientes"},
    {"icon":"😌","title":"Reduz Overtraining","description":"Previne a sindrome de overtraining em atletas de alta performance"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"5g","servings_per_container":60,"calories":0}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 colher (5g)","timing":"Pos-treino ou antes de dormir","preparation":"Dissolva em agua, suco ou shake","frequency":"Diariamente","notes":"Em periodos de estresse intenso ou imunidade baixa, pode aumentar para 10g/dia divididos em 2 doses."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Glutamina ajuda no ganho de massa?","answer":"Indiretamente. Ao melhorar a recuperacao e reducir o catabolismo, permite treinar mais e melhor."},
    {"question":"Funciona mesmo para nao atletas?","answer":"Sim. Para saude intestinal e imunidade, qualquer pessoa pode se beneficiar da suplementacao de glutamina."},
    {"question":"Posso misturar com whey?","answer":"Sim, e uma combinacao classica e muito eficaz para recuperacao pos-treino."}
  ]'::jsonb ELSE faq END
WHERE slug = 'glutamina-300g';

-- Mass Gainer 3kg
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Calorias certas. Massa de verdade.'),
  is_featured = TRUE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 367,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja','Gluten'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"📈","title":"Surplus Calorico","description":"600 calorias por porcao para garantir o superavit necessario ao ganho de massa"},
    {"icon":"💪","title":"Proteina Dupla","description":"Combinacao de proteina rapida e lenta para anabolismo constante"},
    {"icon":"⚡","title":"Carboidratos Complexos","description":"Maltodextrina e aveia fornecem energia sustentada para treinos pesados"},
    {"icon":"🏋️","title":"Para Ectomorfos","description":"Formulado especialmente para quem tem dificuldade em ganhar peso"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"150g","servings_per_container":20,"calories":600,"protein_g":30,"carbs_g":100,"fat_g":6,"fiber_g":4,"sodium_mg":200}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 porcao (150g, aproximadamente 3 scoops)","timing":"Apos o treino ou no cafe da manha","preparation":"Misture em 400 a 500ml de leite integral","frequency":"1 a 2 vezes ao dia conforme necessidade calorica","notes":"Para ganho limpo, prefira pos-treino imediato. Combine com dieta rica em proteinas e treino de forca."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Vou engordar gordura?","answer":"Depende da dieta total. Use para atingir seu surplus calorico diario, mas controle a ingestao total de calorias."},
    {"question":"Posso tomar antes de dormir?","answer":"Nao e recomendado. As calorias antes de dormir sem atividade tendem a ser estocadas como gordura. Priorize o pos-treino e manha."},
    {"question":"Qual a diferenca de um whey simples?","answer":"O hipercalorico tem muito mais carboidratos e calorias por porcao, ideal para quem precisa de um grande surplus calorico."}
  ]'::jsonb ELSE faq END
WHERE slug = 'mass-gainer-hipercalorico-3kg';

-- Thermo Cuts 60 caps
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Queima a mais. Treina a mais. Perde a mais.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.5, rating_count = 289,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🔥","title":"Queima de Gordura","description":"Combinacao de termogenicos que aceleram o metabolismo e a oxidacao de gordura"},
    {"icon":"⚡","title":"Energia e Foco","description":"Cafeina e cha verde para energia e foco sem o crash do cafe comum"},
    {"icon":"🎯","title":"Supressao do Apetite","description":"Cromo picolinato ajuda a controlar o apetite e reduzir compulsoes"},
    {"icon":"🏃","title":"Performance Aerobica","description":"L-Carnitina transporta acidos graxos para as mitocondrias como combustivel"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"2 capsulas","servings_per_container":30,"calories":10,"caffeine_mg":200}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"2 capsulas","timing":"30 minutos antes do treino ou no cafe da manha","preparation":"Engolir com agua","frequency":"Apenas nos dias de treino ou conforme orientacao medica","notes":"Nao tome apos as 16h. Evite combinar com outras fontes de cafeina."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Termogenico faz emagrecer sozinho?","answer":"Nao. E um auxiliar que potencializa os efeitos da dieta e do exercicio. Sem dieta e treino, o efeito e minimo."},
    {"question":"Posso tomar em dias sem treino?","answer":"Pode, mas o efeito e potencializado quando combinado com exercicio. Em dias de descanso, 1 capsula de manha e suficiente."},
    {"question":"Tem efeito rebote?","answer":"Nao causa efeito rebote. Ao suspender, o metabolismo volta ao normal gradualmente."}
  ]'::jsonb ELSE faq END
WHERE slug = 'thermo-cuts-termogenico-60caps';

-- Multivitaminico 60 caps
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Tudo que seu corpo precisa. Em uma capsula.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 412,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified','Vegetarian Friendly'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🌿","title":"Formula Completa","description":"23 vitaminas e minerais essenciais para atletas e praticantes de atividade fisica"},
    {"icon":"⚡","title":"Energia Celular","description":"Complexo B completo para producao de energia e metabolismo eficiente"},
    {"icon":"🛡️","title":"Imunidade","description":"Vitaminas C, D e Zinco para defesa imunologica robusta"},
    {"icon":"💪","title":"Funcao Muscular","description":"Magnesio e Potassio para contracao muscular eficiente e prevencao de caimbras"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"2 capsulas","servings_per_container":30,"calories":10,"vitamin_d3_ui":1000,"vitamin_k2_mcg":75}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"2 capsulas","timing":"Junto com a refeicao principal do dia","preparation":"Engolir com agua","frequency":"Diariamente","notes":"A melhor absorcao das vitaminas liposoluveis (A, D, E, K) ocorre com alimentos contendo gordura."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Preciso tomar vitaminas tendo boa alimentacao?","answer":"Atletas tem necessidades aumentadas de micronutrientes. Mesmo com boa dieta, suplementar garante que nenhuma deficiencia limite sua performance."},
    {"question":"Posso tomar em jejum?","answer":"Funciona melhor com alimentos. Em jejum, as vitaminas liposoluveis tem absorcao reduzida."},
    {"question":"Tem excesso de vitaminas?","answer":"A formula e dimensionada para atletas. Todas as doses estao dentro dos limites seguros estabelecidos pela ANVISA."}
  ]'::jsonb ELSE faq END
WHERE slug = 'multivitaminico-sport-complete-60caps';

-- Vitamina D3+K2 60 caps
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Sua saude comeca por dentro.'),
  is_featured = TRUE, is_best_seller = FALSE,
  rating_average = 4.8, rating_count = 523,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','Vegetarian Friendly','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🦴","title":"Ossos Fortes","description":"D3 e K2 trabalham em sinergia para absorcao e fixacao do calcio nos ossos"},
    {"icon":"🛡️","title":"Imunidade","description":"Vitamina D essencial para funcao imunologica otimizada"},
    {"icon":"❤️","title":"Saude Cardiovascular","description":"K2 direciona o calcio para os ossos, protegendo as arterias de calcificacao"},
    {"icon":"😌","title":"Bem-estar","description":"Regula o humor, a motivacao e combate a fadiga cronica"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"1 capsula","servings_per_container":60,"calories":5,"vitamin_d3_ui":2000,"vitamin_k2_mcg":100}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 capsula","timing":"Junto com a refeicao principal","preparation":"Engolir com agua","frequency":"Diariamente","notes":"Melhor absorcao com alimentos contendo gordura. Consulte medico para doses acima do recomendado."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Preciso de exame antes de tomar?","answer":"Para suplementacao padrao (2000 UI/dia), nao e necessario. Para doses terapeuticas, recomendamos avaliar com medico."},
    {"question":"Por que D3 com K2?","answer":"O K2 e essencial para direcionar o calcio absorvido pela D3 para os ossos, evitando calcificacao arterial."},
    {"question":"Quanto tempo ate sentir diferenca?","answer":"Niveis sericos se normalizam em 2 a 3 meses de uso continuo."}
  ]'::jsonb ELSE faq END
WHERE slug = 'vitamina-d3-k2-2000ui-60caps';

-- Omega-3 120 caps
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Cerebro afiado. Coracao protegido. Corpo equilibrado.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 345,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','IFOS 5 Estrelas','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Peixe'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"❤️","title":"Saude Cardiovascular","description":"EPA reduz triglicerideos e protege o coracao, comprovado em centenas de estudos"},
    {"icon":"🧠","title":"Funcao Cognitiva","description":"DHA e o principal componente estrutural do cerebro, essencial para memoria e foco"},
    {"icon":"🔥","title":"Anti-inflamatorio","description":"Omega-3 reduz inflamacao sistemica, acelerando a recuperacao muscular pos-treino"},
    {"icon":"🦴","title":"Articulacoes Saudaveis","description":"Lubrifica e protege as articulacoes, essencial para treinos de longo prazo"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"2 capsulas","servings_per_container":60,"calories":20,"fat_g":2}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"2 capsulas","timing":"Junto com as refeicoes","preparation":"Engolir inteiras com agua","frequency":"Diariamente","notes":"Para minimizar o retrogusto de peixe, guarde na geladeira. A absorcao e maior com refeicoes ricas em gordura."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Qual a diferenca para omega-3 de farmacia?","answer":"A concentracao de EPA e DHA e muito superior. Nossa formula concentrada tem 3x mais ativos por capsula."},
    {"question":"Vegetarianos podem usar?","answer":"Esta formula contem oleo de peixe. Para vegetarianos, recomendamos omega-3 de algas."},
    {"question":"Quanto tempo para ver resultados?","answer":"Efeitos anti-inflamatorios em 4 a 6 semanas. Beneficios cardiovasculares e cognitivos com 3 meses de uso continuo."}
  ]'::jsonb ELSE faq END
WHERE slug = 'omega-3-fish-oil-120caps';

-- ZMA 90 caps
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Sono reparador. Hormonios otimizados. Recuperacao maxima.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 178,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"😴","title":"Sono Profundo","description":"Magnesio melhora a qualidade do sono, essencial para recuperacao hormonal"},
    {"icon":"💪","title":"Testosterona Natural","description":"Zinco e Magnesio suportam a producao natural de testosterona e GH"},
    {"icon":"⚡","title":"Funcao Muscular","description":"Magnesio e cofator em mais de 300 reacoes enzimaticas, incluindo contracao muscular"},
    {"icon":"🛡️","title":"Imunidade","description":"Zinco e essencial para funcao imunologica e cicatrizacao de tecidos"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"3 capsulas","servings_per_container":30,"calories":5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"3 capsulas","timing":"30 a 60 minutos antes de dormir","preparation":"Engolir com agua","frequency":"Diariamente","notes":"Tome com estomago vazio. Evite tomar com calcio, pois compete com o zinco na absorcao."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"ZMA realmente aumenta testosterona?","answer":"Em individuos com deficiencia de zinco e magnesio (comum em atletas), a suplementacao restaura niveis normais de testosterona."},
    {"question":"Por que tomar a noite?","answer":"O magnesio facilita o relaxamento muscular e melhora a qualidade do sono, quando ocorre a maior parte da recuperacao hormonal."},
    {"question":"Sentirei diferenca rapido?","answer":"Melhoras no sono sao percebidas na primeira semana. Beneficios hormonais levam de 4 a 8 semanas."}
  ]'::jsonb ELSE faq END
WHERE slug = 'zma-zinco-magnesio-b6-90caps';

-- EAA 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Todos os 9 aminoacidos essenciais. Nenhuma desculpa.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.7, rating_count = 267,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🧬","title":"Aminoacidos Completos","description":"Todos os 9 aminoacidos essenciais que o corpo nao produz, em doses terapeuticas"},
    {"icon":"💪","title":"Sintese Proteica","description":"Estimula a mTOR (via anabolica principal) de forma direta e eficiente"},
    {"icon":"🛡️","title":"Anticatabólico","description":"Protege a massa muscular em deficit calorico, jejum e treinos de longa duracao"},
    {"icon":"⚡","title":"Intraworkout Perfeito","description":"Fornece aminoacidos durante o treino para prevenir fadiga e catabolismo"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"10g","servings_per_container":30,"calories":40,"leucine_g":3.5,"isoleucine_g":1.5,"valine_g":1.5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (10g)","timing":"Durante o treino ou apos o treino","preparation":"Misture em 300 a 400ml de agua gelada","frequency":"Nos dias de treino","notes":"Ideal para consumir durante o treino (intraworkout)."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"EAA e melhor que BCAA?","answer":"EAA e mais completo pois inclui todos os aminoacidos essenciais. Para quem nao consome proteina suficiente, EAA e superior."},
    {"question":"Posso substituir o whey por EAA?","answer":"Nao completamente. O whey tem beneficios adicionais. EAA e melhor usado como complemento intraworkout."},
    {"question":"Veganos podem usar?","answer":"Nossa formula usa aminoacidos fermentados de fonte vegetal, sem derivados animais."}
  ]'::jsonb ELSE faq END
WHERE slug = 'eaa-essential-amino-acids-300g';

-- Pre-treino Pump Extreme 300g
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Pump que nao acaba. Performance que surpreende.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 189,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🩸","title":"Pump Extremo","description":"Formula com 8g de citrulina e agmatina para vasodilatacao intensa e duradoura"},
    {"icon":"⚡","title":"Energia Focada","description":"Cafeina mais Taurina para energia e foco sem o nervosismo dos pre-treinos muito estimulados"},
    {"icon":"🫀","title":"Oxido Nitrico","description":"Beterraba em po e arginina elevam o oxido nitrico para maxima entrega de O2"},
    {"icon":"💪","title":"Volume Muscular","description":"O pump nao e so estetico: maior volume significa mais sinais anabolicos intracelulares"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"10g","servings_per_container":30,"calories":30,"carbs_g":6,"caffeine_mg":150,"citrulline_malate_g":8,"arginine_g":2}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (10g)","timing":"20 a 30 minutos antes do treino","preparation":"Misture em 200ml de agua gelada","frequency":"Apenas nos dias de treino","notes":"Para pump maximo, tome com estomago relativamente vazio."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Esse pre-treino e sem estimulante?","answer":"Tem 150mg de cafeina, uma dose moderada. O foco principal da formula e no pump (vasodilatacao)."},
    {"question":"Posso combinar com creatina?","answer":"Sim, e uma combinacao excelente. Creatina potencializa a forca enquanto o pump melhora a entrega de nutrientes."},
    {"question":"Por que a beterraba em po?","answer":"Rica em nitratos naturais que o corpo converte em oxido nitrico, melhorando a vasodilatacao e a eficiencia muscular."}
  ]'::jsonb ELSE faq END
WHERE slug = 'pre-treino-pump-extreme-300g';

-- Camiseta Dry-Fit MarombaClub
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Vista a mentalidade. Vista o clube.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.8, rating_count = 234,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Tecido Certificado OEKO-TEX','Producao Nacional Responsavel'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💧","title":"Dry-Fit Premium","description":"Tecnologia de secagem rapida que mantem voce seco e confortavel durante o treino"},
    {"icon":"🌬️","title":"Tecido Respiravel","description":"Malha tecnica que permite circulacao de ar, regulando a temperatura corporal"},
    {"icon":"💪","title":"Corte Anatomico","description":"Modelagem que acompanha o corpo sem comprometer os movimentos"},
    {"icon":"🖤","title":"Design Exclusivo","description":"Estampa exclusiva MarombaClub. Mostre que voce faz parte do clube"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = '{}'::jsonb,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"Uso diario ou durante treinos","timing":"","preparation":"Lavar a mao ou centrifuga leve. Nao usar alvejante. Secar a sombra.","frequency":"","notes":"Para maior durabilidade, lavar ao avesso e secar na sombra. Evitar secadora."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Como escolher o tamanho?","answer":"Nossa tabela de medidas esta disponivel nas fotos do produto. Em caso de duvida, prefira o tamanho maior para conforto durante o treino."},
    {"question":"Encolhe na lavagem?","answer":"Nao encolhe se lavada corretamente. Recomendamos agua fria e secar na sombra."},
    {"question":"Disponivel em outras cores?","answer":"Lancamos novas cores sazonalmente. Assine o Clube para receber acesso antecipado aos lancamentos."}
  ]'::jsonb ELSE faq END
WHERE slug = 'camiseta-dry-fit-marombaclub';

-- Whey Isolado Gold Standard
UPDATE products SET
  short_promise = COALESCE(short_promise, 'O padrao ouro da proteina. Agora no Maromba Club.'),
  is_featured = TRUE, is_best_seller = TRUE,
  rating_average = 4.9, rating_count = 1567,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','Informed Sport','NSF Certified','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY['Leite','Soja'] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"🏆","title":"Padrao Ouro","description":"A formula de referencia mundial em proteina de alta qualidade e sabor"},
    {"icon":"💎","title":"90 Porcento de Proteina","description":"Processo de isolamento por ultrafiltracao garante pureza maxima a cada porcao"},
    {"icon":"🚫","title":"Zero Lactose e Gluten","description":"Ideal para intolerantes e pessoas com sensibilidades alimentares"},
    {"icon":"⚡","title":"Variedade de Sabores","description":"A mais ampla linha de sabores do mercado para voce nunca enjoar"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"29g","servings_per_container":31,"calories":110,"protein_g":24,"carbs_g":2,"fat_g":1.5,"sodium_mg":130}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (29g)","timing":"Apos o treino ou entre refeicoes","preparation":"Misture com 180 a 200ml de agua gelada ou leite","frequency":"1 a 2 vezes ao dia","notes":"O Gold Standard dissolve perfeitamente sem grumos. Use um shaker com mola para textura perfeita."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Por que e o mais vendido do mundo?","answer":"Combinacao imbativel de qualidade, sabor, biodisponibilidade e resultados comprovados ao longo de mais de 30 anos no mercado."},
    {"question":"E melhor que os wheys nacionais?","answer":"E um dos melhores do mundo. O Gold Standard se destaca pelo sabor e consistencia de qualidade."},
    {"question":"Tem gluten?","answer":"Nao contem gluten. Certificado para celiacos e pessoas com sensibilidade ao gluten."}
  ]'::jsonb ELSE faq END
WHERE slug = 'whey-protein-isolado-gold-standard';

-- Pre-treino Brutal Force
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Forca bruta. Resultado brutal.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.6, rating_count = 145,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💪","title":"Formula All-in-One","description":"Citrulina, creatina, cafeina e beta-alanina em uma so dose para maximo resultado"},
    {"icon":"⚡","title":"Energia Imediata","description":"250mg de cafeina para energia explosiva desde o primeiro rep"},
    {"icon":"🩸","title":"Pump e Forca","description":"Citrulina mais creatina integrada para pump e forca em uma unica formula"},
    {"icon":"🔥","title":"Anti-fadiga","description":"Beta-alanina atrasa a fadiga para treinos mais longos e mais intensos"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"15g","servings_per_container":20,"calories":35,"carbs_g":7,"caffeine_mg":250,"citrulline_malate_g":6,"beta_alanine_g":3.2,"creatine_g":3}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (15g)","timing":"25 a 30 minutos antes do treino","preparation":"Misture em 200ml de agua gelada","frequency":"Apenas nos dias de treino","notes":"Por conter creatina, voce pode adicionar mais 2g de creatina extra para atingir a dose completa de 5g."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Ja tem creatina na formula?","answer":"Sim, 3g por dose. Para maximizar os beneficios, adicione mais 2g de creatina pura ao shaker."},
    {"question":"Posso tomar todos os dias?","answer":"Apenas nos dias de treino. A cafeina em dose elevada todos os dias pode gerar tolerancia."},
    {"question":"Iniciantes podem usar?","answer":"Com cautela. A dose de cafeina e elevada. Recomendamos comecar com meia dose para testar tolerancia."}
  ]'::jsonb ELSE faq END
WHERE slug = 'pre-treino-brutal-force';

-- BCAA Instantâneo
UPDATE products SET
  short_promise = COALESCE(short_promise, 'Dissolucao instantanea. Acao imediata.'),
  is_featured = FALSE, is_best_seller = FALSE,
  rating_average = 4.5, rating_count = 89,
  certifications = CASE WHEN certifications IS NULL OR certifications = '{}' THEN ARRAY['Certificado ANVISA','GMP Certified'] ELSE certifications END,
  allergens = CASE WHEN allergens IS NULL OR allergens = '{}' THEN ARRAY[]::TEXT[] ELSE allergens END,
  benefits = CASE WHEN benefits IS NULL OR benefits = '[]'::jsonb THEN '[
    {"icon":"💧","title":"Dissolucao Instantanea","description":"Processo de instantizacao garante dissolucao completa em agua fria sem agitar"},
    {"icon":"🛡️","title":"Anticatabólico","description":"Proporcao 2:1:1 classica e cientificamente validada para prevencao de catabolismo"},
    {"icon":"🌟","title":"Sabor Superior","description":"Sem o gosto amargo tipico dos BCAAs convencionais"},
    {"icon":"⚡","title":"Absorcao Rapida","description":"Particulas menores aumentam a area de superficie para absorcao intestinal mais rapida"}
  ]'::jsonb ELSE benefits END,
  nutrition_facts = CASE WHEN nutrition_facts IS NULL OR nutrition_facts = '{}'::jsonb THEN '{"serving_size":"10g","servings_per_container":30,"calories":40,"leucine_g":5,"isoleucine_g":2.5,"valine_g":2.5}'::jsonb ELSE nutrition_facts END,
  how_to_use = CASE WHEN how_to_use IS NULL OR how_to_use = '{}'::jsonb THEN '{"dose":"1 scoop (10g)","timing":"Antes, durante ou apos o treino","preparation":"Despeje em agua e misture levemente. Dissolve instantaneamente.","frequency":"Nos dias de treino","notes":"A versao instantanea e ideal para quem nao gosta de usar shaker. Funciona perfeitamente em garrafa simples."}'::jsonb ELSE how_to_use END,
  faq = CASE WHEN faq IS NULL OR faq = '[]'::jsonb THEN '[
    {"question":"Qual a diferenca para o BCAA comum?","answer":"O processo de instantizacao melhora a dissolucao, o sabor e a absorcao. O aminograma e o mesmo, mas a experiencia de uso e muito superior."},
    {"question":"Posso misturar com pre-treino?","answer":"Sim, e uma combinacao classica. Adicione ao seu pre-treino para proteger a massa muscular e melhorar a performance."},
    {"question":"Veganos podem usar?","answer":"Sim. Nossos aminoacidos sao produzidos por fermentacao vegetal, sem qualquer derivado animal."}
  ]'::jsonb ELSE faq END
WHERE slug = 'bcaa-211-instantaneo';
