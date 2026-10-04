package com.nido.backend.service;

import com.nido.backend.dto.MovementRequest;
import com.nido.backend.dto.PurchaseEntryRequest;
import com.nido.backend.dto.ShoppingEntryRequest;
import com.nido.backend.dto.ShoppingEntryResponse;
import com.nido.backend.entity.Category;
import com.nido.backend.entity.Household;
import com.nido.backend.entity.InventoryMovement;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.ShoppingListEntry;
import com.nido.backend.repository.CategoryRepository;
import com.nido.backend.repository.HouseholdRepository;
import com.nido.backend.repository.ItemRepository;
import com.nido.backend.repository.ShoppingListEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ShoppingListService {

    private final ShoppingListEntryRepository shoppingRepository;
    private final HouseholdRepository householdRepository;
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final HouseholdService householdService;
    private final InventoryService inventoryService;

    public ShoppingListService(ShoppingListEntryRepository shoppingRepository,
                               HouseholdRepository householdRepository,
                               ItemRepository itemRepository,
                               CategoryRepository categoryRepository,
                               HouseholdService householdService,
                               InventoryService inventoryService) {
        this.shoppingRepository = shoppingRepository;
        this.householdRepository = householdRepository;
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.householdService = householdService;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public List<ShoppingEntryResponse> getShoppingList(Long householdId, ShoppingListEntry.Status status, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        List<ShoppingListEntry> entries = (status != null)
                ? shoppingRepository.findByHouseholdIdAndStatusOrderByCreatedAtDesc(householdId, status)
                : shoppingRepository.findByHouseholdIdOrderByCreatedAtDesc(householdId);

        return entries.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ShoppingEntryResponse addEntry(Long householdId, ShoppingEntryRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        int qty = (request.pendingQuantity() != null && request.pendingQuantity() > 0) ? request.pendingQuantity() : 1;
        String name = request.name().trim();

        Item item = null;
        if (request.itemId() != null) {
            item = itemRepository.findById(request.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
            if (!item.getHousehold().getId().equals(householdId)) {
                throw new IllegalArgumentException("El producto no pertenece al hogar");
            }
            name = item.getName();

            // Si ya existe una entrada PENDING para este item, agrupamos
            Optional<ShoppingListEntry> existing = shoppingRepository.findByHouseholdIdAndItemIdAndStatus(
                    householdId, item.getId(), ShoppingListEntry.Status.PENDING
            );
            if (existing.isPresent()) {
                ShoppingListEntry entry = existing.get();
                entry.setPendingQuantity(entry.getPendingQuantity() + qty);
                return toResponse(entry);
            }
        } else {
            // Si ya existe una entrada PENDING por nombre, agrupamos
            Optional<ShoppingListEntry> existing = shoppingRepository.findByHouseholdIdAndNameIgnoreCaseAndStatus(
                    householdId, name, ShoppingListEntry.Status.PENDING
            );
            if (existing.isPresent()) {
                ShoppingListEntry entry = existing.get();
                entry.setPendingQuantity(entry.getPendingQuantity() + qty);
                return toResponse(entry);
            }
        }

        ShoppingListEntry entry = new ShoppingListEntry(household, item, name, qty);
        entry = shoppingRepository.save(entry);
        return toResponse(entry);
    }

    @Transactional
    public ShoppingEntryResponse updateEntryQuantity(Long householdId, Long entryId, int quantity, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        ShoppingListEntry entry = shoppingRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Entrada no encontrada"));

        if (!entry.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La entrada no pertenece al hogar");
        }

        if (quantity <= 0) {
            entry.setPendingQuantity(0);
            entry.setStatus(ShoppingListEntry.Status.COMPLETED);
        } else {
            entry.setPendingQuantity(quantity);
            entry.setStatus(ShoppingListEntry.Status.PENDING);
        }

        return toResponse(entry);
    }

    @Transactional
    public void deleteEntry(Long householdId, Long entryId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        ShoppingListEntry entry = shoppingRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Entrada no encontrada"));

        if (!entry.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La entrada no pertenece al hogar");
        }

        shoppingRepository.delete(entry);
    }

    @Transactional
    public ShoppingEntryResponse purchaseEntry(Long householdId, Long entryId, PurchaseEntryRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        ShoppingListEntry entry = shoppingRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Entrada no encontrada"));

        if (!entry.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La entrada no pertenece al hogar");
        }

        Item item = entry.getItem();
        if (item == null) {
            // Si no estaba asociado a un Item previo, lo creamos o asociamos
            Long catId = request.createAsCategoryId() != null ? request.createAsCategoryId() : 1L; // 1L = Alimentos por defecto
            Category category = categoryRepository.findById(catId)
                    .orElseGet(() -> categoryRepository.findAll().getFirst());

            item = new Item(
                    entry.getHousehold(),
                    category,
                    entry.getName(),
                    "Creado automáticamente desde la lista de la compra",
                    Item.ItemType.CONSUMABLE,
                    null,
                    "unidades",
                    null,
                    null
            );
            item = itemRepository.save(item);
            entry.setItem(item);
        }

        // Registrar movimiento ENTRY en inventario con transacción atómica
        MovementRequest moveReq = new MovementRequest(
                InventoryMovement.MovementType.ENTRY,
                request.quantityPurchased(),
                null,
                request.destinationLocationId(),
                "Compra desde lista de la compra",
                request.batchNumber(),
                request.expirationDate()
        );
        inventoryService.recordMovement(householdId, item.getId(), moveReq, userEmail);

        // Descontar la cantidad comprada de la pendiente
        int remaining = entry.getPendingQuantity() - request.quantityPurchased();
        if (remaining <= 0) {
            entry.setPendingQuantity(0);
            entry.setStatus(ShoppingListEntry.Status.COMPLETED);
        } else {
            entry.setPendingQuantity(remaining);
        }

        return toResponse(entry);
    }

    private ShoppingEntryResponse toResponse(ShoppingListEntry e) {
        return new ShoppingEntryResponse(
                e.getId(),
                e.getHousehold().getId(),
                e.getItem() != null ? e.getItem().getId() : null,
                e.getItem() != null ? e.getItem().getName() : null,
                e.getName(),
                e.getPendingQuantity(),
                e.getStatus(),
                e.getCreatedAt()
        );
    }
}
