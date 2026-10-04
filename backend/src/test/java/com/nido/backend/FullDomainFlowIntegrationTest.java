package com.nido.backend;

import com.nido.backend.dto.HouseholdRequest;
import com.nido.backend.dto.ItemRequest;
import com.nido.backend.dto.LocationRequest;
import com.nido.backend.dto.MovementRequest;
import com.nido.backend.dto.PurchaseEntryRequest;
import com.nido.backend.dto.RegisterRequest;
import com.nido.backend.dto.ShoppingEntryRequest;
import com.nido.backend.entity.InventoryMovement;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.ShoppingListEntry;
import com.nido.backend.exception.AccessDeniedDomainException;
import com.nido.backend.service.AuthService;
import com.nido.backend.service.DashboardService;
import com.nido.backend.service.HouseholdService;
import com.nido.backend.service.InventoryService;
import com.nido.backend.service.LocationService;
import com.nido.backend.service.RecipeService;
import com.nido.backend.service.ShoppingListService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class FullDomainFlowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private HouseholdService householdService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ShoppingListService shoppingListService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private RecipeService recipeService;

    private String userEmail1;
    private String userEmail2;

    @BeforeEach
    void setUp() {
        long ts = System.currentTimeMillis();
        userEmail1 = "user1_" + ts + "@test.com";
        userEmail2 = "user2_" + ts + "@test.com";

        authService.register(new RegisterRequest("User One", userEmail1, "Password123"));
        authService.register(new RegisterRequest("User Two", userEmail2, "Password123"));
    }

    @Test
    void shouldCreateHouseholdHierarchyAndManageStock() {
        // 1. Crear hogar
        var household = householdService.createHousehold(new HouseholdRequest("Mi Casa de Prueba"), userEmail1);
        assertNotNull(household.id());

        // 2. Crear ubicaciones jerárquicas: Cocina -> Despensa
        var cocina = locationService.createLocation(household.id(), new LocationRequest(null, "Cocina"), userEmail1);
        var despensa = locationService.createLocation(household.id(), new LocationRequest(cocina.id(), "Despensa"), userEmail1);
        assertEquals("Cocina > Despensa", despensa.fullPath());

        // 3. Crear producto consumible con stock mínimo
        var item = inventoryService.createItem(household.id(), new ItemRequest(
                1L, // Alimentos
                "Arroz Redondo",
                "Arroz para paella o guisos",
                Item.ItemType.CONSUMABLE,
                2, // Mínimo
                "paquetes",
                null,
                null
        ), userEmail1);

        // 4. Registrar Entrada de 5 unidades
        inventoryService.recordMovement(household.id(), item.id(), new MovementRequest(
                InventoryMovement.MovementType.ENTRY,
                5,
                null,
                despensa.id(),
                "Compra semanal",
                "LOTE-123",
                null
        ), userEmail1);

        var updatedItem = inventoryService.getItemById(household.id(), item.id(), userEmail1);
        assertEquals(5, updatedItem.totalStock());
        assertFalse(updatedItem.isLowStock());

        // 5. Consumir 4 unidades -> Queda 1 (menor o igual a mínimo 2 -> isLowStock = true)
        inventoryService.recordMovement(household.id(), item.id(), new MovementRequest(
                InventoryMovement.MovementType.EXIT,
                4,
                despensa.id(),
                null,
                "Cena de grupo",
                null,
                null
        ), userEmail1);

        updatedItem = inventoryService.getItemById(household.id(), item.id(), userEmail1);
        assertEquals(1, updatedItem.totalStock());
        assertTrue(updatedItem.isLowStock());

        // 6. Comprobar Dashboard y Lista de compra
        var summary = dashboardService.getSummary(household.id(), 90, userEmail1);
        assertEquals(1, summary.lowStockCount());

        // 7. Añadir a lista de compra y simular compra que entra a stock
        var shopEntry = shoppingListService.addEntry(household.id(), new ShoppingEntryRequest(item.id(), "Arroz", 3), userEmail1);
        assertEquals(ShoppingListEntry.Status.PENDING, shopEntry.status());

        shoppingListService.purchaseEntry(household.id(), shopEntry.id(), new PurchaseEntryRequest(
                3,
                despensa.id(),
                null,
                null,
                null
        ), userEmail1);

        updatedItem = inventoryService.getItemById(household.id(), item.id(), userEmail1);
        assertEquals(4, updatedItem.totalStock());
        assertFalse(updatedItem.isLowStock());

        // 8. Verificar que usuario 2 no tiene acceso a este hogar (Aislamiento de seguridad)
        assertThrows(AccessDeniedDomainException.class, () -> {
            locationService.getLocationsByHousehold(household.id(), false, userEmail2);
        });

        // 9. Comprobar catálogo de recetas
        var recipes = recipeService.getRecommendations(household.id(), userEmail1);
        assertNotNull(recipes);
        assertFalse(recipes.isEmpty());

        // 10. Archivar producto
        inventoryService.archiveItem(household.id(), item.id(), userEmail1);
        var activeItems = inventoryService.getItemsByHousehold(household.id(), false, userEmail1);
        assertTrue(activeItems.stream().noneMatch(i -> i.id().equals(item.id())));

        // 11. Eliminar producto definitivamente
        inventoryService.deleteItem(household.id(), item.id(), userEmail1);
        assertThrows(IllegalArgumentException.class, () -> {
            inventoryService.getItemById(household.id(), item.id(), userEmail1);
        });
    }
}
