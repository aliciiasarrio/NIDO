package com.nido.backend.dto;

import java.util.List;

public record RecipeRecommendation(
        String id,
        String title,
        String description,
        int cookingTimeMinutes,
        int matchPercentage,
        List<String> availableIngredients,
        List<String> missingIngredients,
        boolean hasExpiringIngredients
) {
}
