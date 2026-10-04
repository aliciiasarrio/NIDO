package com.nido.backend.repository;

import com.nido.backend.entity.ShoppingListEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListEntryRepository extends JpaRepository<ShoppingListEntry, Long> {
    List<ShoppingListEntry> findByHouseholdIdOrderByCreatedAtDesc(Long householdId);
    List<ShoppingListEntry> findByHouseholdIdAndStatusOrderByCreatedAtDesc(Long householdId, ShoppingListEntry.Status status);
    List<ShoppingListEntry> findByItemId(Long itemId);
    List<ShoppingListEntry> findByHouseholdIdAndItemId(Long householdId, Long itemId);
    Optional<ShoppingListEntry> findByHouseholdIdAndItemIdAndStatus(Long householdId, Long itemId, ShoppingListEntry.Status status);
    Optional<ShoppingListEntry> findByHouseholdIdAndNameIgnoreCaseAndStatus(Long householdId, String name, ShoppingListEntry.Status status);
    boolean existsByHouseholdIdAndItemIdAndStatus(Long householdId, Long itemId, ShoppingListEntry.Status status);
}
