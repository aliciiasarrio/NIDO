package com.nido.backend.controller;

import com.nido.backend.dto.CatalogProductResponse;
import com.nido.backend.service.CatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<CatalogProductResponse> getCatalog(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category
    ) {
        return catalogService.searchCatalog(query, category);
    }
}
