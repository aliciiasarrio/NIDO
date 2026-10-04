package com.nido.backend.controller;

import com.nido.backend.dto.ItemRequest;
import com.nido.backend.dto.ItemResponse;
import com.nido.backend.dto.MovementRequest;
import com.nido.backend.dto.MovementResponse;
import com.nido.backend.service.InventoryService;
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

@RestController
@RequestMapping("/api/households/{householdId}/items")
public class ItemController {

    private final InventoryService inventoryService;

    public ItemController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<ItemResponse> getItems(@PathVariable Long householdId,
                                       @RequestParam(required = false, defaultValue = "false") boolean includeArchived,
                                       Principal principal) {
        return inventoryService.getItemsByHousehold(householdId, includeArchived, principal.getName());
    }

    @GetMapping("/{id}")
    public ItemResponse getItem(@PathVariable Long householdId,
                                @PathVariable Long id,
                                Principal principal) {
        return inventoryService.getItemById(householdId, id, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse createItem(@PathVariable Long householdId,
                                   @Valid @RequestBody ItemRequest request,
                                   Principal principal) {
        return inventoryService.createItem(householdId, request, principal.getName());
    }

    @PutMapping("/{id}")
    public ItemResponse updateItem(@PathVariable Long householdId,
                                   @PathVariable Long id,
                                   @Valid @RequestBody ItemRequest request,
                                   Principal principal) {
        return inventoryService.updateItem(householdId, id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveItem(@PathVariable Long householdId,
                            @PathVariable Long id,
                            Principal principal) {
        inventoryService.archiveItem(householdId, id, principal.getName());
    }

    @PostMapping("/{id}/wear")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordClothingWorn(@PathVariable Long householdId,
                                   @PathVariable Long id,
                                   Principal principal) {
        inventoryService.recordClothingWorn(householdId, id, principal.getName());
    }

    @PostMapping("/{id}/movements")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse recordMovement(@PathVariable Long householdId,
                                           @PathVariable Long id,
                                           @Valid @RequestBody MovementRequest request,
                                           Principal principal) {
        return inventoryService.recordMovement(householdId, id, request, principal.getName());
    }

    @GetMapping("/{id}/movements")
    public List<MovementResponse> getItemMovements(@PathVariable Long householdId,
                                                  @PathVariable Long id,
                                                  Principal principal) {
        return inventoryService.getItemMovements(householdId, id, principal.getName());
    }
}
