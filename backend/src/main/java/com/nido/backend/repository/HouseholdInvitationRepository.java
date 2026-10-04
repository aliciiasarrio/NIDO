package com.nido.backend.repository;

import com.nido.backend.entity.HouseholdInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HouseholdInvitationRepository extends JpaRepository<HouseholdInvitation, Long> {
    Optional<HouseholdInvitation> findByCode(String code);
}
