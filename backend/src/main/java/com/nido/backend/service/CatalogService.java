package com.nido.backend.service;

import com.nido.backend.dto.CatalogProductResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class CatalogService {

    private static final List<CatalogProductResponse> CATALOG = List.of(
            // Alimentos
            new CatalogProductResponse("1", "Arroz redondo", "Alimentos", "CONSUMABLE", "paquetes", 2, new BigDecimal("1.10"), new BigDecimal("1.45"), "€/kg", "Mercadona / Carrefour", ""),
            new CatalogProductResponse("2", "Leche entera", "Alimentos", "CONSUMABLE", "briks", 6, new BigDecimal("0.89"), new BigDecimal("1.15"), "€/L", "Hacendado / Central Lechera", ""),
            new CatalogProductResponse("3", "Aceite de oliva virgen extra", "Alimentos", "CONSUMABLE", "botellas", 2, new BigDecimal("7.50"), new BigDecimal("9.95"), "€/L", "Carrefour / Mercadona", ""),
            new CatalogProductResponse("4", "Huevos camperos (Docena)", "Alimentos", "CONSUMABLE", "docenas", 1, new BigDecimal("2.20"), new BigDecimal("2.85"), "€/docena", "Día / Mercadona", ""),
            new CatalogProductResponse("5", "Pasta espaguetis", "Alimentos", "CONSUMABLE", "paquetes", 2, new BigDecimal("0.85"), new BigDecimal("1.20"), "€/paquete", "Gallo / Barilla", ""),
            new CatalogProductResponse("6", "Tomate frito casero", "Alimentos", "CONSUMABLE", "tarros", 3, new BigDecimal("1.15"), new BigDecimal("1.65"), "€/tarro", "Orlando / Solís", ""),
            new CatalogProductResponse("7", "Atún claro en aceite de oliva", "Alimentos", "CONSUMABLE", "packs", 2, new BigDecimal("2.80"), new BigDecimal("3.60"), "€/pack 3 latas", "Calvo / Hacendado", ""),
            new CatalogProductResponse("8", "Café molido natural", "Alimentos", "CONSUMABLE", "paquetes", 2, new BigDecimal("1.90"), new BigDecimal("3.20"), "€/250g", "Marcilla / Bonka", ""),
            new CatalogProductResponse("9", "Patatas lavadas", "Alimentos", "CONSUMABLE", "mallas", 1, new BigDecimal("2.40"), new BigDecimal("3.50"), "€/malla 3kg", "Mercado local", ""),
            new CatalogProductResponse("10", "Pechuga de pollo fileteada", "Alimentos", "CONSUMABLE", "bandejas", 1, new BigDecimal("6.50"), new BigDecimal("8.20"), "€/kg", "Carnicería / Supermercado", ""),
            new CatalogProductResponse("11", "Lentejas pardinas", "Alimentos", "CONSUMABLE", "paquetes", 2, new BigDecimal("1.35"), new BigDecimal("1.90"), "€/kg", "Luengo / Hacendado", ""),
            new CatalogProductResponse("12", "Avena en copos suaves", "Alimentos", "CONSUMABLE", "paquetes", 1, new BigDecimal("0.95"), new BigDecimal("1.50"), "€/500g", "Kölln / Hacendado", ""),

            // Limpieza
            new CatalogProductResponse("13", "Detergente líquido lavadora", "Limpieza", "CONSUMABLE", "botellas", 1, new BigDecimal("4.50"), new BigDecimal("8.90"), "€/botella 40 lavados", "Ariel / Wipp Express", ""),
            new CatalogProductResponse("14", "Suavizante concentrado", "Limpieza", "CONSUMABLE", "botellas", 1, new BigDecimal("1.95"), new BigDecimal("3.40"), "€/botella", "Flor / Mimosín", ""),
            new CatalogProductResponse("15", "Lavavajillas a mano concentrado", "Limpieza", "CONSUMABLE", "botes", 2, new BigDecimal("1.80"), new BigDecimal("2.95"), "€/bote 650ml", "Fairy / Somat", ""),
            new CatalogProductResponse("16", "Pastillas lavavajillas todo en 1", "Limpieza", "CONSUMABLE", "cajas", 1, new BigDecimal("7.90"), new BigDecimal("13.50"), "€/caja 50 uds", "Finish / Fairy Platinum", ""),
            new CatalogProductResponse("17", "Limpiador multiusos con lejía", "Limpieza", "CONSUMABLE", "pistolas", 1, new BigDecimal("1.40"), new BigDecimal("2.25"), "€/spray 750ml", "Estrella / Cif", ""),
            new CatalogProductResponse("18", "Papel de cocina doble capa", "Limpieza", "CONSUMABLE", "rollos", 4, new BigDecimal("2.10"), new BigDecimal("3.80"), "€/pack 6 rollos", "Colhogar / Foxy", ""),
            new CatalogProductResponse("19", "Bolsas de basura 30L autocierre", "Limpieza", "CONSUMABLE", "rollos", 2, new BigDecimal("1.30"), new BigDecimal("2.10"), "€/rollo 20 uds", "Bosque Verde / Handy Bag", ""),
            new CatalogProductResponse("20", "Estropajo con salvauñas", "Limpieza", "CONSUMABLE", "packs", 1, new BigDecimal("1.10"), new BigDecimal("1.90"), "€/pack 3 uds", "Scotch-Brite / Spontex", ""),

            // Ropa (Duraderos)
            new CatalogProductResponse("21", "Camiseta básica de algodón", "Ropa", "DURABLE", "prendas", null, new BigDecimal("6.00"), new BigDecimal("15.00"), "€/prenda", "Zara / Mango / Uniqlo", ""),
            new CatalogProductResponse("22", "Pantalón vaquero corte regular", "Ropa", "DURABLE", "prendas", null, new BigDecimal("25.00"), new BigDecimal("59.00"), "€/prenda", "Levi's / Zara", ""),
            new CatalogProductResponse("23", "Sudadera con capucha", "Ropa", "DURABLE", "prendas", null, new BigDecimal("19.00"), new BigDecimal("39.00"), "€/prenda", "Pull&Bear / H&M", ""),
            new CatalogProductResponse("24", "Camisa lino manga larga", "Ropa", "DURABLE", "prendas", null, new BigDecimal("29.00"), new BigDecimal("49.00"), "€/prenda", "Massimo Dutti / Mango", ""),
            new CatalogProductResponse("25", "Chaqueta impermeable ligera", "Ropa", "DURABLE", "prendas", null, new BigDecimal("35.00"), new BigDecimal("79.00"), "€/prenda", "Decathlon / North Face", ""),

            // Vajilla y Otros
            new CatalogProductResponse("26", "Juego de 6 vasos de cristal fino", "Vajilla", "DURABLE", "sets", null, new BigDecimal("8.00"), new BigDecimal("18.00"), "€/set", "IKEA / Duralex", ""),
            new CatalogProductResponse("27", "Sartén antiadherente 24cm", "Vajilla", "DURABLE", "unidades", null, new BigDecimal("14.00"), new BigDecimal("32.00"), "€/unidad", "Tefal / Bra", ""),
            new CatalogProductResponse("28", "Cuchillo cocinero chef 20cm", "Vajilla", "DURABLE", "unidades", null, new BigDecimal("12.00"), new BigDecimal("28.00"), "€/unidad", "Arcos / 3 Claveles", ""),
            new CatalogProductResponse("29", "Pilas alcalinas AA", "Otros", "CONSUMABLE", "packs", 1, new BigDecimal("2.50"), new BigDecimal("5.50"), "€/pack 4 uds", "Duracell / Energizer", ""),
            new CatalogProductResponse("30", "Bombilla LED E27 luz cálida", "Otros", "CONSUMABLE", "unidades", 2, new BigDecimal("2.20"), new BigDecimal("4.50"), "€/unidad", "Philips / Osram", "")
    );

    public List<CatalogProductResponse> searchCatalog(String query, String categoryName) {
        String q = query != null ? query.trim().toLowerCase(Locale.ROOT) : "";
        String cat = categoryName != null ? categoryName.trim().toLowerCase(Locale.ROOT) : "";

        return CATALOG.stream()
                .filter(p -> q.isEmpty() || p.name().toLowerCase(Locale.ROOT).contains(q) || p.marketReference().toLowerCase(Locale.ROOT).contains(q))
                .filter(p -> cat.isEmpty() || p.categoryName().toLowerCase(Locale.ROOT).equals(cat))
                .toList();
    }

    public List<CatalogProductResponse> getAllCatalog() {
        return CATALOG;
    }
}
