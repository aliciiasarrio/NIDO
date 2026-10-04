package com.nido.backend.repository;

import com.nido.backend.entity.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {
    List<HouseholdMember> findByUserId(Long userId);
    List<HouseholdMember> findByHouseholdId(Long householdId);
    Optional<HouseholdMember> findByHouseholdIdAndUserId(Long householdId, Long userId);
    boolean existsByHouseholdIdAndUserId(Long householdId, Long userId);
}
