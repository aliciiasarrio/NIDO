package com.nido.backend.service;

import com.nido.backend.dto.RecipeRecommendation;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.Stock;
import com.nido.backend.repository.ItemRepository;
import com.nido.backend.repository.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class RecipeService {

    private final ItemRepository itemRepository;
    private final StockRepository stockRepository;
    private final HouseholdService householdService;

    public record LocalRecipe(
            String id,
            String title,
            String description,
            int cookingTimeMinutes,
            List<String> requiredIngredients
    ) {}

    private static final List<LocalRecipe> CATALOG = List.of(
            new LocalRecipe("1", "Tortilla de Patatas", "Clásica tortilla española jugosa y deliciosa", 30,
                    List.of("huevos", "patatas", "cebolla", "aceite")),
            new LocalRecipe("2", "Pasta al Ajo y Aceite", "Receta rápida y reconfortante con pocos ingredientes", 15,
                    List.of("pasta", "ajo", "aceite")),
            new LocalRecipe("3", "Arroz con Tomate y Huevo", "Plato casero perfecto para el día a día", 20,
                    List.of("arroz", "tomate", "huevos", "aceite")),
            new LocalRecipe("4", "Ensalada Completa", "Ensalada fresca y nutritiva", 10,
                    List.of("lechuga", "tomate", "atún", "aceite", "sal")),
            new LocalRecipe("5", "Pollo al Ajillo", "Pechugas o muslos dorados con salsa de ajo", 25,
                    List.of("pollo", "ajo", "aceite", "sal")),
            new LocalRecipe("6", "Lentejas Caseras", "Guiso tradicional reconfortante", 45,
                    List.of("lentejas", "cebolla", "patatas", "zanahoria", "aceite")),
            new LocalRecipe("7", "Sopa de Verduras", "Sopa depurativa con verduras de temporada", 30,
                    List.of("zanahoria", "cebolla", "patatas", "sal"))
    );

    public RecipeService(ItemRepository itemRepository, StockRepository stockRepository, HouseholdService householdService) {
        this.itemRepository = itemRepository;
        this.stockRepository = stockRepository;
        this.householdService = householdService;
    }

    @Transactional(readOnly = true)
    public List<RecipeRecommendation> getRecommendations(Long householdId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        // Obtenemos los alimentos disponibles en el hogar con stock > 0
        List<Item> activeItems = itemRepository.findByHouseholdIdAndArchivedAtIsNull(householdId);
        Set<String> availableFoodNames = new HashSet<>();
        Set<String> expiringFoodNames = new HashSet<>();
        LocalDate today = LocalDate.now();
        LocalDate soon = today.plusDays(7);

        for (Item item : activeItems) {
            // Considerar si es categoría Alimentos o cualquier alimento disponible
            List<Stock> stocks = stockRepository.findByItemId(item.getId());
            int total = stocks.stream().mapToInt(Stock::getQuantity).sum();
            if (total > 0) {
                String cleanName = normalize(item.getName());
                availableFoodNames.add(cleanName);

                // Comprobar si no está caducado y está próximo a caducar
                for (Stock st : stocks) {
                    if (st.getQuantity() > 0 && st.getExpirationDate() != null) {
                        if (!st.getExpirationDate().isBefore(today) && !st.getExpirationDate().isAfter(soon)) {
                            expiringFoodNames.add(cleanName);
                        }
                    }
                }
            }
        }

        List<RecipeRecommendation> recommendations = new ArrayList<>();

        for (LocalRecipe recipe : CATALOG) {
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();
            boolean hasExpiring = false;

            for (String ing : recipe.requiredIngredients()) {
                boolean found = false;
                for (String avail : availableFoodNames) {
                    if (avail.contains(ing) || ing.contains(avail)) {
                        found = true;
                        matched.add(ing);
                        if (expiringFoodNames.stream().anyMatch(e -> e.contains(ing) || ing.contains(e))) {
                            hasExpiring = true;
                        }
                        break;
                    }
                }
                if (!found) {
                    missing.add(ing);
                }
            }

            int totalIngredients = recipe.requiredIngredients().size();
            int matchPercentage = totalIngredients > 0 ? (matched.size() * 100) / totalIngredients : 0;

            // Priorizar recetas donde hay al menos algún ingrediente disponible
            recommendations.add(new RecipeRecommendation(
                    recipe.id(),
                    recipe.title(),
                    recipe.description(),
                    recipe.cookingTimeMinutes(),
                    matchPercentage,
                    matched,
                    missing,
                    hasExpiring
            ));
        }

        // Ordenar: primero las que tienen ingredientes a punto de caducar, luego por mayor % de afinidad
        recommendations.sort((r1, r2) -> {
            if (r1.hasExpiringIngredients() != r2.hasExpiringIngredients()) {
                return r1.hasExpiringIngredients() ? -1 : 1;
            }
            return Integer.compare(r2.matchPercentage(), r1.matchPercentage());
        });

        return recommendations;
    }

    private String normalize(String str) {
        return str.toLowerCase(Locale.ROOT).trim();
    }
}
