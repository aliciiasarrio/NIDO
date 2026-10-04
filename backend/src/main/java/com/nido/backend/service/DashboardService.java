package com.nido.backend.service;

import com.nido.backend.dto.DashboardSummaryResponse;
import com.nido.backend.dto.ItemResponse;
import com.nido.backend.dto.StockResponse;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.ShoppingListEntry;
import com.nido.backend.repository.ItemRepository;
import com.nido.backend.repository.LocationRepository;
import com.nido.backend.repository.ShoppingListEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final ItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final ShoppingListEntryRepository shoppingRepository;
    private final InventoryService inventoryService;
    private final HouseholdService householdService;

    public DashboardService(ItemRepository itemRepository,
                            LocationRepository locationRepository,
                            ShoppingListEntryRepository shoppingRepository,
                            InventoryService inventoryService,
                            HouseholdService householdService) {
        this.itemRepository = itemRepository;
        this.locationRepository = locationRepository;
        this.shoppingRepository = shoppingRepository;
        this.inventoryService = inventoryService;
        this.householdService = householdService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long householdId, int unwornDaysThreshold, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        List<Item> activeItems = itemRepository.findByHouseholdIdAndArchivedAtIsNull(householdId);
        long totalLocations = locationRepository.findByHouseholdIdAndArchivedAtIsNull(householdId).size();
        long pendingShoppingCount = shoppingRepository.findByHouseholdIdAndStatusOrderByCreatedAtDesc(householdId, ShoppingListEntry.Status.PENDING).size();

        List<ItemResponse> allItemResponses = activeItems.stream()
                .map(inventoryService::toItemResponse)
                .toList();

        List<ItemResponse> lowStockItems = allItemResponses.stream()
                .filter(ItemResponse::isLowStock)
                .toList();

        LocalDate soonDate = LocalDate.now().plusDays(7);
        List<StockResponse> expiringSoonStocks = new ArrayList<>();

        for (ItemResponse item : allItemResponses) {
            for (StockResponse stock : item.stocks()) {
                if (stock.expirationDate() != null &&
                        !stock.expirationDate().isAfter(soonDate) &&
                        stock.quantity() > 0) {
                    expiringSoonStocks.add(stock);
                }
            }
        }

        Instant unwornLimit = Instant.now().minus(unwornDaysThreshold, ChronoUnit.DAYS);
        List<ItemResponse> unwornClothingItems = allItemResponses.stream()
                .filter(i -> "Ropa".equalsIgnoreCase(i.categoryName()) || i.clothingSize() != null)
                .filter(i -> i.lastWornAt() == null || i.lastWornAt().isBefore(unwornLimit))
                .toList();

        return new DashboardSummaryResponse(
                activeItems.size(),
                totalLocations,
                lowStockItems.size(),
                expiringSoonStocks.size(),
                pendingShoppingCount,
                unwornClothingItems.size(),
                lowStockItems,
                expiringSoonStocks,
                unwornClothingItems
        );
    }
}
