package com.nido.backend.service;

import com.nido.backend.dto.ItemRequest;
import com.nido.backend.dto.ItemResponse;
import com.nido.backend.dto.MovementRequest;
import com.nido.backend.dto.MovementResponse;
import com.nido.backend.dto.StockResponse;
import com.nido.backend.entity.Category;
import com.nido.backend.entity.Household;
import com.nido.backend.entity.InventoryMovement;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.Location;
import com.nido.backend.entity.Stock;
import com.nido.backend.repository.CategoryRepository;
import com.nido.backend.repository.HouseholdRepository;
import com.nido.backend.repository.InventoryMovementRepository;
import com.nido.backend.repository.ItemRepository;
import com.nido.backend.repository.LocationRepository;
import com.nido.backend.repository.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InventoryService {

    private final ItemRepository itemRepository;
    private final StockRepository stockRepository;
    private final InventoryMovementRepository movementRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdService householdService;
    private final LocationService locationService;

    public InventoryService(ItemRepository itemRepository,
                            StockRepository stockRepository,
                            InventoryMovementRepository movementRepository,
                            LocationRepository locationRepository,
                            CategoryRepository categoryRepository,
                            HouseholdRepository householdRepository,
                            HouseholdService householdService,
                            LocationService locationService) {
        this.itemRepository = itemRepository;
        this.stockRepository = stockRepository;
        this.movementRepository = movementRepository;
        this.locationRepository = locationRepository;
        this.categoryRepository = categoryRepository;
        this.householdRepository = householdRepository;
        this.householdService = householdService;
        this.locationService = locationService;
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getItemsByHousehold(Long householdId, boolean includeArchived, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        List<Item> items = includeArchived
                ? itemRepository.findByHouseholdId(householdId)
                : itemRepository.findByHouseholdIdAndArchivedAtIsNull(householdId);

        return items.stream()
                .map(this::toItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long householdId, Long itemId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar indicado");
        }
        return toItemResponse(item);
    }

    @Transactional
    public ItemResponse createItem(Long householdId, ItemRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        Integer minQty = request.minimumQuantity();
        if (request.itemType() == Item.ItemType.DURABLE) {
            minQty = null;
        }

        Item item = new Item(
                household,
                category,
                request.name().trim(),
                request.description(),
                request.itemType(),
                minQty,
                request.unit(),
                request.clothingSize(),
                request.clothingColor()
        );
        item.setImageData(request.imageData());
        item.setMarketReference(request.marketReference());
        item.setMarketPriceMin(request.marketPriceMin());
        item.setMarketPriceMax(request.marketPriceMax());

        item = itemRepository.save(item);
        return toItemResponse(item);
    }

    @Transactional
    public ItemResponse updateItem(Long householdId, Long itemId, ItemRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar indicado");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        item.setCategory(category);
        item.setName(request.name().trim());
        item.setDescription(request.description());
        item.setItemType(request.itemType());
        item.setUnit(request.unit());
        item.setClothingSize(request.clothingSize());
        item.setClothingColor(request.clothingColor());
        item.setImageData(request.imageData());
        item.setMarketReference(request.marketReference());
        item.setMarketPriceMin(request.marketPriceMin());
        item.setMarketPriceMax(request.marketPriceMax());

        if (request.itemType() == Item.ItemType.CONSUMABLE) {
            item.setMinimumQuantity(request.minimumQuantity());
        } else {
            item.setMinimumQuantity(null);
        }

        return toItemResponse(item);
    }

    @Transactional
    public void recordClothingWorn(Long householdId, Long itemId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Prenda no encontrada"));

        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar");
        }

        item.setLastWornAt(Instant.now());
    }

    @Transactional
    public void archiveItem(Long householdId, Long itemId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar");
        }

        // Si tiene stock restante, registramos las salidas automáticas por retirada
        List<Stock> stocks = stockRepository.findByItemId(itemId);
        for (Stock st : stocks) {
            if (st.getQuantity() > 0) {
                InventoryMovement movement = new InventoryMovement(
                        item,
                        InventoryMovement.MovementType.EXIT,
                        st.getQuantity(),
                        st.getLocation(),
                        null,
                        "Retirada por archivado del producto"
                );
                movementRepository.save(movement);
                st.setQuantity(0);
            }
        }

        item.setArchivedAt(Instant.now());
    }

    @Transactional
    public MovementResponse recordMovement(Long householdId, Long itemId, MovementRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar");
        }

        if (item.isArchived()) {
            throw new IllegalArgumentException("No se pueden registrar movimientos en un producto archivado");
        }

        Location source = null;
        Location destination = null;

        switch (request.movementType()) {
            case ENTRY -> {
                if (request.destinationLocationId() == null) {
                    throw new IllegalArgumentException("La ubicación de destino es obligatoria para una entrada");
                }
                destination = validateLocation(householdId, request.destinationLocationId());
                final Location targetDest = destination;

                Stock stock = stockRepository.findByItemIdAndLocationId(itemId, targetDest.getId())
                        .orElseGet(() -> new Stock(item, targetDest, 0, request.batchNumber(), request.expirationDate()));

                stock.setQuantity(stock.getQuantity() + request.quantity());
                if (request.batchNumber() != null && !request.batchNumber().isBlank()) {
                    stock.setBatchNumber(request.batchNumber());
                }
                if (request.expirationDate() != null) {
                    stock.setExpirationDate(request.expirationDate());
                }
                stockRepository.save(stock);
            }
            case EXIT -> {
                if (request.sourceLocationId() == null) {
                    throw new IllegalArgumentException("La ubicación de origen es obligatoria para una salida");
                }
                source = validateLocation(householdId, request.sourceLocationId());

                Stock stock = stockRepository.findByItemIdAndLocationId(itemId, source.getId())
                        .orElseThrow(() -> new IllegalArgumentException("No existen existencias en la ubicación de origen"));

                if (stock.getQuantity() < request.quantity()) {
                    throw new IllegalArgumentException("No hay suficiente cantidad para retirar (disponible: " + stock.getQuantity() + ")");
                }

                stock.setQuantity(stock.getQuantity() - request.quantity());
                stockRepository.save(stock);
            }
            case TRANSFER -> {
                if (request.sourceLocationId() == null || request.destinationLocationId() == null) {
                    throw new IllegalArgumentException("Origen y destino son obligatorios para un traslado");
                }
                if (request.sourceLocationId().equals(request.destinationLocationId())) {
                    throw new IllegalArgumentException("El origen y destino del traslado no pueden ser iguales");
                }

                source = validateLocation(householdId, request.sourceLocationId());
                destination = validateLocation(householdId, request.destinationLocationId());
                final Location targetDest = destination;

                Stock sourceStock = stockRepository.findByItemIdAndLocationId(itemId, source.getId())
                        .orElseThrow(() -> new IllegalArgumentException("No existen existencias en la ubicación de origen"));

                if (sourceStock.getQuantity() < request.quantity()) {
                    throw new IllegalArgumentException("No hay suficiente cantidad en origen para trasladar (disponible: " + sourceStock.getQuantity() + ")");
                }

                sourceStock.setQuantity(sourceStock.getQuantity() - request.quantity());
                stockRepository.save(sourceStock);

                Stock destStock = stockRepository.findByItemIdAndLocationId(itemId, targetDest.getId())
                        .orElseGet(() -> new Stock(item, targetDest, 0, sourceStock.getBatchNumber(), sourceStock.getExpirationDate()));

                destStock.setQuantity(destStock.getQuantity() + request.quantity());
                stockRepository.save(destStock);
            }
            case ADJUSTMENT -> {
                if (request.reason() == null || request.reason().trim().isEmpty()) {
                    throw new IllegalArgumentException("El motivo es obligatorio para un ajuste de inventario");
                }

                if (request.destinationLocationId() != null) {
                    destination = validateLocation(householdId, request.destinationLocationId());
                    final Location targetDest = destination;
                    Stock stock = stockRepository.findByItemIdAndLocationId(itemId, targetDest.getId())
                            .orElseGet(() -> new Stock(item, targetDest, 0, null, null));
                    stock.setQuantity(stock.getQuantity() + request.quantity());
                    stockRepository.save(stock);
                } else if (request.sourceLocationId() != null) {
                    source = validateLocation(householdId, request.sourceLocationId());
                    Stock stock = stockRepository.findByItemIdAndLocationId(itemId, source.getId())
                            .orElseThrow(() -> new IllegalArgumentException("No hay existencias para ajustar en esa ubicación"));

                    if (stock.getQuantity() < request.quantity()) {
                        throw new IllegalArgumentException("La reducción por ajuste no puede superar el stock existente");
                    }
                    stock.setQuantity(stock.getQuantity() - request.quantity());
                    stockRepository.save(stock);
                } else {
                    throw new IllegalArgumentException("Debes especificar la ubicación de ajuste");
                }
            }
        }

        InventoryMovement movement = new InventoryMovement(
                item,
                request.movementType(),
                request.quantity(),
                source,
                destination,
                request.reason()
        );

        movement = movementRepository.save(movement);

        return new MovementResponse(
                movement.getId(),
                item.getId(),
                item.getName(),
                movement.getMovementType(),
                movement.getQuantity(),
                source != null ? source.getId() : null,
                source != null ? source.getName() : null,
                destination != null ? destination.getId() : null,
                destination != null ? destination.getName() : null,
                movement.getReason(),
                movement.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<MovementResponse> getItemMovements(Long householdId, Long itemId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!item.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("El producto no pertenece al hogar");
        }

        return movementRepository.findByItemIdOrderByCreatedAtDesc(itemId).stream()
                .map(m -> new MovementResponse(
                        m.getId(),
                        item.getId(),
                        item.getName(),
                        m.getMovementType(),
                        m.getQuantity(),
                        m.getSourceLocation() != null ? m.getSourceLocation().getId() : null,
                        m.getSourceLocation() != null ? m.getSourceLocation().getName() : null,
                        m.getDestinationLocation() != null ? m.getDestinationLocation().getId() : null,
                        m.getDestinationLocation() != null ? m.getDestinationLocation().getName() : null,
                        m.getReason(),
                        m.getCreatedAt()
                ))
                .toList();
    }

    private Location validateLocation(Long householdId, Long locationId) {
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Ubicación no encontrada"));
        if (!loc.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La ubicación no pertenece al hogar actual");
        }
        if (loc.isArchived()) {
            throw new IllegalArgumentException("No se pueden realizar operaciones con una ubicación archivada");
        }
        return loc;
    }

    public ItemResponse toItemResponse(Item item) {
        List<Stock> stocks = stockRepository.findByItemId(item.getId());
        int totalStock = stocks.stream().mapToInt(Stock::getQuantity).sum();

        boolean isLowStock = false;
        if (item.getItemType() == Item.ItemType.CONSUMABLE && item.getMinimumQuantity() != null) {
            isLowStock = totalStock <= item.getMinimumQuantity();
        }

        List<StockResponse> stockResponses = stocks.stream()
                .map(s -> new StockResponse(
                        s.getId(),
                        s.getItem().getId(),
                        s.getItem().getName(),
                        s.getLocation().getId(),
                        s.getLocation().getName(),
                        locationService.buildFullPath(s.getLocation()),
                        s.getQuantity(),
                        s.getBatchNumber(),
                        s.getExpirationDate(),
                        s.getCreatedAt()
                ))
                .toList();

        return new ItemResponse(
                item.getId(),
                item.getHousehold().getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getName(),
                item.getDescription(),
                item.getItemType(),
                item.getMinimumQuantity(),
                item.getUnit(),
                item.getClothingSize(),
                item.getClothingColor(),
                item.getLastWornAt(),
                totalStock,
                isLowStock,
                stockResponses,
                item.getImageData(),
                item.getMarketReference(),
                item.getMarketPriceMin(),
                item.getMarketPriceMax(),
                item.getArchivedAt(),
                item.getCreatedAt()
        );
    }
}
