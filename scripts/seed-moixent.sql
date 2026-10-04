-- ============================================================================
-- NIDO: Script de datos de demostración para el hogar "Moixent"
-- Rellena ubicaciones jerárquicas, productos variados (alimentos, limpieza,
-- ropa con tallas/colores, vajilla, otros), existencias (con fechas de caducidad
-- próximas y stock bajo para probar alertas), lista de compra y movimientos.
-- ============================================================================

DO $$
DECLARE
    v_household_id BIGINT;
    v_owner_id BIGINT;
    v_cat_alimentos BIGINT := 1;
    v_cat_limpieza BIGINT := 2;
    v_cat_ropa BIGINT := 3;
    v_cat_vajilla BIGINT := 4;
    v_cat_otros BIGINT := 5;

    -- Ubicaciones Padre
    v_loc_cocina BIGINT;
    v_loc_salon BIGINT;
    v_loc_dormitorio BIGINT;
    v_loc_bano BIGINT;
    v_loc_lavadero BIGINT;
    v_loc_trastero BIGINT;

    -- Sub-ubicaciones
    v_sub_despensa BIGINT;
    v_sub_frigo BIGINT;
    v_sub_congelador BIGINT;
    v_sub_bajo_encimera BIGINT;
    v_sub_cajon_especias BIGINT;
    v_sub_aparador BIGINT;
    v_sub_mueble_bar BIGINT;
    v_sub_armario_ropero BIGINT;
    v_sub_comoda BIGINT;
    v_sub_armario_bano BIGINT;
    v_sub_mueble_toallas BIGINT;
    v_sub_estante_limpieza BIGINT;
    v_sub_estante_trastero BIGINT;

    -- IDs de Items
    v_item_aceite BIGINT;
    v_item_arroz BIGINT;
    v_item_tomate BIGINT;
    v_item_pasta BIGINT;
    v_item_huevos BIGINT;
    v_item_cafe BIGINT;
    v_item_leche BIGINT;
    v_item_atun BIGINT;
    v_item_yogur BIGINT;
    v_item_pollo BIGINT;
    v_item_salmon BIGINT;
    v_item_patatas BIGINT;
    v_item_cebollas BIGINT;
    v_item_ajos BIGINT;
    v_item_helado BIGINT;

    v_item_detergente BIGINT;
    v_item_suavizante BIGINT;
    v_item_pastillas_lavavajillas BIGINT;
    v_item_fregasuelos BIGINT;
    v_item_bayetas BIGINT;
    v_item_papel_higienico BIGINT;
    v_item_limpiacristales BIGINT;

    v_item_vaqueros BIGINT;
    v_item_camisa_lino BIGINT;
    v_item_jersey_merino BIGINT;
    v_item_vestido_floral BIGINT;
    v_item_abrigo_pano BIGINT;
    v_item_zapatillas BIGINT;
    v_item_blazer BIGINT;

    v_item_vajilla_porcelana BIGINT;
    v_item_copas_vino BIGINT;
    v_item_cuberteria BIGINT;
    v_item_sarten_titanio BIGINT;

    v_item_bombillas BIGINT;
    v_item_pilas BIGINT;
    v_item_botiquin BIGINT;
    v_item_caja_herramientas BIGINT;

BEGIN
    -- 1. Obtener ID del hogar "Moixent"
    SELECT id INTO v_household_id FROM households WHERE name ILIKE '%Moixent%' ORDER BY id ASC LIMIT 1;
    IF v_household_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún hogar con el nombre Moixent.';
    END IF;

    -- Obtener usuario propietario
    SELECT user_id INTO v_owner_id FROM household_members WHERE household_id = v_household_id AND role = 'OWNER' LIMIT 1;
    IF v_owner_id IS NULL THEN
        SELECT user_id INTO v_owner_id FROM household_members WHERE household_id = v_household_id LIMIT 1;
    END IF;

    RAISE NOTICE 'Poblando datos para el Hogar ID % (Propietario ID %)', v_household_id, v_owner_id;

    -- Limpieza previa para evitar duplicados si se re-ejecuta
    DELETE FROM inventory_movements WHERE item_id IN (SELECT id FROM items WHERE household_id = v_household_id);
    DELETE FROM shopping_list_entries WHERE household_id = v_household_id;
    DELETE FROM stock WHERE item_id IN (SELECT id FROM items WHERE household_id = v_household_id);
    DELETE FROM items WHERE household_id = v_household_id;
    DELETE FROM locations WHERE household_id = v_household_id;

    -- 2. UBICACIONES JERÁRQUICAS
    -- Raíz: Cocina
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Cocina') RETURNING id INTO v_loc_cocina;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_cocina, 'Despensa principal') RETURNING id INTO v_sub_despensa;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_cocina, 'Frigorífico') RETURNING id INTO v_sub_frigo;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_cocina, 'Congelador') RETURNING id INTO v_sub_congelador;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_cocina, 'Mueble bajo encimera') RETURNING id INTO v_sub_bajo_encimera;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_cocina, 'Cajón de cubiertos y especias') RETURNING id INTO v_sub_cajon_especias;

    -- Raíz: Salón / Comedor
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Salón / Comedor') RETURNING id INTO v_loc_salon;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_salon, 'Aparador') RETURNING id INTO v_sub_aparador;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_salon, 'Mueble bar') RETURNING id INTO v_sub_mueble_bar;

    -- Raíz: Dormitorio Principal
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Dormitorio Principal') RETURNING id INTO v_loc_dormitorio;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_dormitorio, 'Armario ropero') RETURNING id INTO v_sub_armario_ropero;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_dormitorio, 'Cómoda') RETURNING id INTO v_sub_comoda;

    -- Raíz: Baño Principal
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Baño Principal') RETURNING id INTO v_loc_bano;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_bano, 'Armario bajo lavabo') RETURNING id INTO v_sub_armario_bano;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_bano, 'Mueble auxiliar toallas') RETURNING id INTO v_sub_mueble_toallas;

    -- Raíz: Lavadero / Galería
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Lavadero / Galería') RETURNING id INTO v_loc_lavadero;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_lavadero, 'Estantería de limpieza') RETURNING id INTO v_sub_estante_limpieza;

    -- Raíz: Trastero
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, NULL, 'Trastero') RETURNING id INTO v_loc_trastero;
    INSERT INTO locations (household_id, parent_id, name) VALUES (v_household_id, v_loc_trastero, 'Estantería de almacenaje') RETURNING id INTO v_sub_estante_trastero;

    -- 3. ITEMS / PRODUCTOS
    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Aceite de oliva virgen extra', 'Botella 1L primera presión en frío', 'CONSUMABLE', 2, 'botellas', 'Mercadona / Consum', 7.50, 9.95)
    RETURNING id INTO v_item_aceite;

    -- Alimentos Consumibles
    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Arroz Bomba La Fallera 1kg', 'Arroz especial para paella y arroces caldosos', 'CONSUMABLE', 2, 'paquetes', 'Consum / Mercadona', 1.85, 2.15)
    RETURNING id INTO v_item_arroz;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Tomate frito casero Orlando 350g', 'Tomate frito con aceite de oliva', 'CONSUMABLE', 3, 'botes', 'Mercadona', 1.15, 1.45)
    RETURNING id INTO v_item_tomate;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Pasta Espaguetis Barilla nº5 500g', 'Pasta de trigo duro 100% italiano', 'CONSUMABLE', 2, 'paquetes', 'Carrefour', 1.25, 1.55)
    RETURNING id INTO v_item_pasta;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Huevos camperos clase L (docena)', 'Huevos de gallinas camperas criadas en libertad', 'CONSUMABLE', 1, 'docenas', 'Mercadona', 2.30, 2.65)
    RETURNING id INTO v_item_huevos;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Café en grano 100% Arábica 500g', 'Tueste natural aromático para cafetera express', 'CONSUMABLE', 1, 'paquetes', 'Lavazza / Illy', 4.80, 6.50)
    RETURNING id INTO v_item_cafe;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Leche entera Pascual 1L', 'Leche entera con bienestar animal garantizado', 'CONSUMABLE', 6, 'bricks', 'Mercadona', 1.05, 1.15)
    RETURNING id INTO v_item_leche;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Atún claro en aceite de oliva (pack 6)', 'Lata de 80g escurrido perfecto', 'CONSUMABLE', 2, 'packs', 'Calvo / Hacendado', 4.20, 4.90)
    RETURNING id INTO v_item_atun;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Yogur natural cremoso 4x125g', 'Yogur estilo griego natural sin azúcar añadido', 'CONSUMABLE', 2, 'packs', 'Danone / Consum', 1.40, 1.85)
    RETURNING id INTO v_item_yogur;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Pechuga de pollo fresca 600g', 'Filetes finos de pechuga de pollo de corral', 'CONSUMABLE', 1, 'bandejas', 'Carnicería Moixent', 4.50, 5.60)
    RETURNING id INTO v_item_pollo;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Lomos de salmón fresco noruego 400g', 'Salmón con piel rico en Omega 3', 'CONSUMABLE', 1, 'bandejas', 'Pescadería Mercadona', 6.80, 8.20)
    RETURNING id INTO v_item_salmon;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Patatas para cocer y freír (saco 3kg)', 'Variedad agria ideal guisos', 'CONSUMABLE', 1, 'bolsas', 'Frutería local', 2.90, 3.50)
    RETURNING id INTO v_item_patatas;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Cebolla dulce (malla 1kg)', 'Cebollas Fuentes de Ebro', 'CONSUMABLE', 1, 'mallas', 'Consum', 1.40, 1.80)
    RETURNING id INTO v_item_cebollas;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Ajos morados de Las Pedroñeras', 'Cabeza de ajos con I.G.P.', 'CONSUMABLE', 2, 'cabezas', 'Mercadona', 1.10, 1.50)
    RETURNING id INTO v_item_ajos;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_alimentos, 'Helado de Macadamia Nut Brittle 500ml', 'Tarrina de helado de crema con nueces caramelizadas', 'CONSUMABLE', 1, 'tarrinas', 'Häagen-Dazs', 5.20, 6.50)
    RETURNING id INTO v_item_helado;

    -- Limpieza Consumibles
    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Detergente líquido jabón de Marsella 40L', 'Fórmula hipoalergénica para ropa blanca y de color', 'CONSUMABLE', 1, 'botellas', 'Ariel / Mercadona', 6.50, 8.90)
    RETURNING id INTO v_item_detergente;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Suavizante concentrado caricia azul', 'Toque suave y perfume de larga duración', 'CONSUMABLE', 1, 'botellas', 'Flor / Vernel', 2.20, 2.95)
    RETURNING id INTO v_item_suavizante;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Pastillas lavavajillas Todo en 1 (45 uds)', 'Poder antigrasa y abrillantador incluido', 'CONSUMABLE', 1, 'cajas', 'Finish Quantum', 8.50, 11.20)
    RETURNING id INTO v_item_pastillas_lavavajillas;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Fregasuelos aroma pino silvestre 1.5L', 'Secado rápido y brillo natural sin restos', 'CONSUMABLE', 1, 'botellas', 'Bosque Verde', 1.25, 1.60)
    RETURNING id INTO v_item_fregasuelos;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Bayetas de microfibra multiusos (pack 4)', 'Máxima absorción sin pelusas', 'CONSUMABLE', 2, 'packs', 'Vileda', 2.10, 2.80)
    RETURNING id INTO v_item_bayetas;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Papel higiénico acolchado 3 capas (12 rollos)', 'Suavidad y resistencia extra', 'CONSUMABLE', 2, 'packs', 'Foxy / Renova', 4.10, 5.30)
    RETURNING id INTO v_item_papel_higienico;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_limpieza, 'Limpiacristales spray con bio-alcohol 750ml', 'Brillo transparente para espejos y cristales', 'CONSUMABLE', 1, 'sprays', 'Cristasol', 1.80, 2.30)
    RETURNING id INTO v_item_limpiacristales;

    -- Ropa (DURABLE con tallas, colores y fechas de último uso)
    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Vaqueros Levi''s 501 Original Fit', 'Tejido denim resistente corte recto clásico', 'DURABLE', 'W30/L32', 'Azul índigo', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Levi''s Store', 65.00, 95.00)
    RETURNING id INTO v_item_vaqueros;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Camisa de lino cuello mao', 'Lino europeo 100% transpirable', 'DURABLE', 'M', 'Blanco roto', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Zara', 29.95, 35.95)
    RETURNING id INTO v_item_camisa_lino;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Jersey cuello cisne lana merino', 'Lana fina térmica muy suave', 'DURABLE', 'S', 'Gris marengo', CURRENT_TIMESTAMP - INTERVAL '120 days', 'Massimo Dutti', 49.95, 59.95)
    RETURNING id INTO v_item_jersey_merino;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Vestido midi estampado floral de verano', 'Tejido fluido con forro interior', 'DURABLE', '38', 'Multicolor floral', CURRENT_TIMESTAMP - INTERVAL '190 days', 'Mango', 39.99, 49.99)
    RETURNING id INTO v_item_vestido_floral;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Abrigo de paño cruzado clásico', 'Estructura elegante con botones de cuerno', 'DURABLE', 'M', 'Camel tostado', CURRENT_TIMESTAMP - INTERVAL '240 days', 'Zara', 79.95, 99.95)
    RETURNING id INTO v_item_abrigo_pano;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Zapatillas deportivas On Running Cloud', 'Amortiguación zero-gravity para uso diario', 'DURABLE', '41', 'Negro / Blanco', CURRENT_TIMESTAMP - INTERVAL '1 day', 'On Running / FootLocker', 89.00, 129.00)
    RETURNING id INTO v_item_zapatillas;

    INSERT INTO items (household_id, category_id, name, description, item_type, clothing_size, clothing_color, last_worn_at, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_ropa, 'Chaqueta blazer de terciopelo fiesta', 'Corte entallado solapa smoking', 'DURABLE', 'M', 'Azul marino noche', CURRENT_TIMESTAMP - INTERVAL '380 days', 'Sandro / Mango', 69.00, 99.00)
    RETURNING id INTO v_item_blazer;

    -- Vajilla (DURABLE)
    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_vajilla, 'Vajilla de porcelana blanca 18 piezas', '6 llanos, 6 hondos y 6 postre resistentes a microondas', 'DURABLE', 'juegos', 'IKEA Vardera', 39.95, 49.95)
    RETURNING id INTO v_item_vajilla_porcelana;

    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_vajilla, 'Copas de vino tinto cristal fino (set 6)', 'Cristal de Bohemia sonoro 450ml', 'DURABLE', 'sets', 'Bohemia Crystal', 24.00, 32.00)
    RETURNING id INTO v_item_copas_vino;

    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_vajilla, 'Cubertería completa inox 18/10 (24 piezas)', '6 tenedores, 6 cuchillos chuleteros, 6 cucharas, 6 postre', 'DURABLE', 'estuches', 'Monix Milán', 28.50, 42.00)
    RETURNING id INTO v_item_cuberteria;

    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_vajilla, 'Sartén antiadherente titanio 24cm', 'Aluminio fundido libre de PFOA para inducción', 'DURABLE', 'unidades', 'Bra Prior', 22.00, 28.50)
    RETURNING id INTO v_item_sarten_titanio;

    -- Otros (Consumible y Durable)
    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_otros, 'Bombillas LED E27 luz cálida 10W (pack 3)', '806 lúmenes 2700K bajo consumo A+', 'CONSUMABLE', 1, 'packs', 'Philips / Osram', 6.50, 8.50)
    RETURNING id INTO v_item_bombillas;

    INSERT INTO items (household_id, category_id, name, description, item_type, minimum_quantity, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_otros, 'Pilas alcalinas AA larga duración (pack 8)', 'Pilas 1.5V para mandos y detectores', 'CONSUMABLE', 1, 'packs', 'Duracell Plus', 5.50, 7.20)
    RETURNING id INTO v_item_pilas;

    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_otros, 'Botiquín de primeros auxilios doméstico', 'Gasas estériles, vendas, tijeras, betadine y tiritas', 'DURABLE', 'kits', 'Farmacia local', 18.00, 24.50)
    RETURNING id INTO v_item_botiquin;

    INSERT INTO items (household_id, category_id, name, description, item_type, unit, market_reference, market_price_min, market_price_max)
    VALUES (v_household_id, v_cat_otros, 'Caja de herramientas completa 45 piezas', 'Destornilladores, martillo, alicates, nivel y metro', 'DURABLE', 'maletines', 'Leroy Merlin', 29.90, 39.90)
    RETURNING id INTO v_item_caja_herramientas;

    -- 4. EXISTENCIAS (STOCK)
    -- Fechas de caducidad variadas: algunas próximas (para activar el aviso del Dashboard de < 7 días),
    -- otras amplias, y algunos productos bajo stock mínimo (para avisos de reposición).

    -- Aceite de oliva: 1 botella (mínimo es 2 -> BAJO STOCK)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_aceite, v_sub_despensa, 1, 'L-2409-A', CURRENT_DATE + INTERVAL '300 days');

    -- Arroz: 3 paquetes (buen stock)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_arroz, v_sub_despensa, 3, 'L-AR-99', CURRENT_DATE + INTERVAL '240 days');

    -- Tomate frito: 4 botes (3 en despensa, 1 abierto en frigo)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_tomate, v_sub_despensa, 3, 'L-TOM-01', CURRENT_DATE + INTERVAL '180 days');
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_tomate, v_sub_frigo, 1, 'L-TOM-01', CURRENT_DATE + INTERVAL '15 days');

    -- Pasta: 3 paquetes
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_pasta, v_sub_despensa, 3, 'L-BAR-55', CURRENT_DATE + INTERVAL '365 days');

    -- Huevos camperos: 1 docena (expira en 12 días)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_huevos, v_sub_frigo, 1, 'L-HUE-22', CURRENT_DATE + INTERVAL '12 days');

    -- Café: 2 paquetes
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_cafe, v_sub_despensa, 2, 'L-CAF-77', CURRENT_DATE + INTERVAL '200 days');

    -- Leche: 2 bricks (mínimo es 6 -> BAJO STOCK para probar alerta)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_leche, v_sub_despensa, 2, 'L-LEC-14', CURRENT_DATE + INTERVAL '60 days');

    -- Atún: 3 packs
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_atun, v_sub_despensa, 3, 'L-ATUN-04', CURRENT_DATE + INTERVAL '500 days');

    -- Yogur: 2 packs (CADUCA EN 3 DÍAS -> ALERTA DASHBOARD PRÓXIMO A CADUCAR)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_yogur, v_sub_frigo, 2, 'L-YOG-89', CURRENT_DATE + INTERVAL '3 days');

    -- Pechuga de pollo: 1 bandeja (CADUCA EN 2 DÍAS -> ALERTA DASHBOARD)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_pollo, v_sub_frigo, 1, 'L-POL-10', CURRENT_DATE + INTERVAL '2 days');

    -- Salmón fresco: 1 bandeja (CADUCA EN 4 DÍAS -> ALERTA DASHBOARD)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_salmon, v_sub_frigo, 1, 'L-SAL-03', CURRENT_DATE + INTERVAL '4 days');

    -- Patatas: 1 bolsa
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_patatas, v_sub_despensa, 1, 'L-PAT-01', CURRENT_DATE + INTERVAL '25 days');

    -- Cebollas: 1 malla
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_cebollas, v_sub_despensa, 1, 'L-CEB-01', CURRENT_DATE + INTERVAL '30 days');

    -- Ajos: 2 cabezas
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_ajos, v_sub_despensa, 2, 'L-AJO-01', CURRENT_DATE + INTERVAL '60 days');

    -- Helado: 1 tarrina en congelador
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_helado, v_sub_congelador, 1, 'L-HEL-78', CURRENT_DATE + INTERVAL '120 days');

    -- Limpieza
    -- Detergente: 2 botellas en lavadero
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_detergente, v_sub_estante_limpieza, 2, NULL, NULL);

    -- Suavizante: 1 botella en lavadero
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_suavizante, v_sub_estante_limpieza, 1, NULL, NULL);

    -- Pastillas lavavajillas: 0 unidades (mínimo es 1 -> BAJO STOCK AGOTADO)
    -- No insertamos stock para que sea 0

    -- Fregasuelos: 2 botellas
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_fregasuelos, v_sub_estante_limpieza, 2, NULL, NULL);

    -- Bayetas: 3 packs
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_bayetas, v_sub_estante_limpieza, 3, NULL, NULL);

    -- Papel higiénico: 1 pack (mínimo es 2 -> BAJO STOCK)
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_papel_higienico, v_sub_armario_bano, 1, NULL, NULL);

    -- Limpiacristales: 1 spray
    INSERT INTO stock (item_id, location_id, quantity, batch_number, expiration_date)
    VALUES (v_item_limpiacristales, v_sub_estante_limpieza, 1, NULL, NULL);

    -- Ropa en Armario y Cómoda
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_vaqueros, v_sub_armario_ropero, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_camisa_lino, v_sub_armario_ropero, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_jersey_merino, v_sub_comoda, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_vestido_floral, v_sub_armario_ropero, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_abrigo_pano, v_sub_armario_ropero, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_zapatillas, v_sub_armario_ropero, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_blazer, v_sub_armario_ropero, 1);

    -- Vajilla y menaje
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_vajilla_porcelana, v_sub_aparador, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_copas_vino, v_sub_mueble_bar, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_cuberteria, v_sub_cajon_especias, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_sarten_titanio, v_sub_bajo_encimera, 2);

    -- Otros
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_bombillas, v_sub_estante_trastero, 2);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_pilas, v_sub_aparador, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_botiquin, v_sub_mueble_toallas, 1);
    INSERT INTO stock (item_id, location_id, quantity) VALUES (v_item_caja_herramientas, v_sub_estante_trastero, 1);

    -- 5. LISTA DE LA COMPRA
    -- Pendientes (incluye sugerencias de stock bajo y compras habituales)
    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, v_item_pastillas_lavavajillas, 'Pastillas lavavajillas Todo en 1', 2, 'PENDING');

    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, v_item_leche, 'Leche entera Pascual 1L', 6, 'PENDING');

    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, v_item_aceite, 'Aceite de oliva virgen extra', 2, 'PENDING');

    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, NULL, 'Manzanas Golden Delicious 1.5kg', 1, 'PENDING');
    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, NULL, 'Pan rústico de masa madre recién horneado', 2, 'PENDING');

    -- Compradas / Completadas recientemente
    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, v_item_detergente, 'Detergente líquido jabón de Marsella 40L', 1, 'COMPLETED');

    INSERT INTO shopping_list_entries (household_id, item_id, name, pending_quantity, status)
    VALUES (v_household_id, v_item_cafe, 'Café en grano 100% Arábica 500g', 1, 'COMPLETED');

    -- 6. HISTORIAL DE MOVIMIENTOS DE INVENTARIO
    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_aceite, 'ENTRY', 2, NULL, v_sub_despensa, 'Compra mensual inicial de despensa', CURRENT_TIMESTAMP - INTERVAL '10 days');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_aceite, 'EXIT', 1, v_sub_despensa, NULL, 'Consumo en cocina para preparar comidas', CURRENT_TIMESTAMP - INTERVAL '3 days');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_arroz, 'ENTRY', 3, NULL, v_sub_despensa, 'Reposición semanal supermercado', CURRENT_TIMESTAMP - INTERVAL '7 days');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_pollo, 'ENTRY', 2, NULL, v_sub_frigo, 'Compra carnicería fresca de Moixent', CURRENT_TIMESTAMP - INTERVAL '2 days');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_pollo, 'EXIT', 1, v_sub_frigo, NULL, 'Cena en familia', CURRENT_TIMESTAMP - INTERVAL '1 day');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_tomate, 'TRANSFER', 1, v_sub_despensa, v_sub_frigo, 'Traslado de bote abierto al frigorífico', CURRENT_TIMESTAMP - INTERVAL '1 day');

    INSERT INTO inventory_movements (item_id, movement_type, quantity, source_location_id, destination_location_id, reason, created_at)
    VALUES (v_item_detergente, 'ENTRY', 2, NULL, v_sub_estante_limpieza, 'Compra de productos de limpieza para el lavadero', CURRENT_TIMESTAMP - INTERVAL '5 days');

    -- 7. CÓDIGO DE INVITACIÓN ACTIVO PARA EL HOGAR
    DELETE FROM household_invitations WHERE household_id = v_household_id;
    INSERT INTO household_invitations (household_id, code, created_by, expires_at)
    VALUES (v_household_id, 'MOIX2026', v_owner_id, CURRENT_TIMESTAMP + INTERVAL '14 days');

    RAISE NOTICE '¡Datos para Casa Moixent creados con éxito total!';
END $$;
