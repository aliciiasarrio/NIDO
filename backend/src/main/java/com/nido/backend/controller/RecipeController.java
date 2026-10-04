package com.nido.backend.controller;

import com.nido.backend.dto.RecipeRecommendation;
import com.nido.backend.service.RecipeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/households/{householdId}/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping("/recommendations")
    public List<RecipeRecommendation> getRecommendations(@PathVariable Long householdId, Principal principal) {
        return recipeService.getRecommendations(householdId, principal.getName());
    }
}
