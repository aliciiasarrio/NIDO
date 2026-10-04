package com.nido.backend.repository;

import com.nido.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByHouseholdId(Long householdId);
    List<Location> findByHouseholdIdAndArchivedAtIsNull(Long householdId);
    List<Location> findByParentIdAndArchivedAtIsNull(Long parentId);
    boolean existsByHouseholdIdAndParentIdAndArchivedAtIsNullAndNameIgnoreCase(Long householdId, Long parentId, String name);
    boolean existsByHouseholdIdAndParentIsNullAndArchivedAtIsNullAndNameIgnoreCase(Long householdId, String name);
}
