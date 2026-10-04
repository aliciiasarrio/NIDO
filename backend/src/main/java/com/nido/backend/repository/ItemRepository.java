package com.nido.backend.repository;

import com.nido.backend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByHouseholdId(Long householdId);
    List<Item> findByHouseholdIdAndArchivedAtIsNull(Long householdId);
}
