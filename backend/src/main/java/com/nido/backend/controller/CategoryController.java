package com.nido.backend.controller;

import com.nido.backend.dto.CategoryResponse;
import com.nido.backend.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/api/categories")
    public List<CategoryResponse> getCategories() {
        return categoryService.getAllCategories();
    }
}
