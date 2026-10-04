package com.nido.backend.dto;

import java.util.List;

public record DashboardSummaryResponse(
        long totalItems,
        long totalLocations,
        long lowStockCount,
        long expiringSoonCount,
        long pendingShoppingCount,
        long unwornClothingCount,
        List<ItemResponse> lowStockItems,
        List<StockResponse> expiringSoonStocks,
        List<ItemResponse> unwornClothingItems
) {
}
