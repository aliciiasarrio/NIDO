package com.nido.backend.controller;

import com.nido.backend.dto.PurchaseEntryRequest;
import com.nido.backend.dto.ShoppingEntryRequest;
import com.nido.backend.dto.ShoppingEntryResponse;
import com.nido.backend.entity.ShoppingListEntry;
import com.nido.backend.service.ShoppingListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/households/{householdId}/shopping-list")
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    public ShoppingListController(ShoppingListService shoppingListService) {
        this.shoppingListService = shoppingListService;
    }

    @GetMapping
    public List<ShoppingEntryResponse> getShoppingList(@PathVariable Long householdId,
                                                       @RequestParam(required = false) ShoppingListEntry.Status status,
                                                       Principal principal) {
        return shoppingListService.getShoppingList(householdId, status, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingEntryResponse addEntry(@PathVariable Long householdId,
                                          @Valid @RequestBody ShoppingEntryRequest request,
                                          Principal principal) {
        return shoppingListService.addEntry(householdId, request, principal.getName());
    }

    @PutMapping("/{id}/quantity")
    public ShoppingEntryResponse updateQuantity(@PathVariable Long householdId,
                                                @PathVariable Long id,
                                                @RequestBody Map<String, Integer> body,
                                                Principal principal) {
        int qty = body.getOrDefault("quantity", 1);
        return shoppingListService.updateEntryQuantity(householdId, id, qty, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable Long householdId,
                            @PathVariable Long id,
                            Principal principal) {
        shoppingListService.deleteEntry(householdId, id, principal.getName());
    }

    @PostMapping("/{id}/purchase")
    public ShoppingEntryResponse purchaseEntry(@PathVariable Long householdId,
                                               @PathVariable Long id,
                                               @Valid @RequestBody PurchaseEntryRequest request,
                                               Principal principal) {
        return shoppingListService.purchaseEntry(householdId, id, request, principal.getName());
    }
}
