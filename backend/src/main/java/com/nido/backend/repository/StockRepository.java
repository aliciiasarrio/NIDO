package com.nido.backend.repository;

import com.nido.backend.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByItemId(Long itemId);
    void deleteByItemId(Long itemId);
    List<Stock> findByLocationId(Long locationId);
    Optional<Stock> findByItemIdAndLocationId(Long itemId, Long locationId);
    boolean existsByLocationIdAndQuantityGreaterThan(Long locationId, Integer quantity);
}
