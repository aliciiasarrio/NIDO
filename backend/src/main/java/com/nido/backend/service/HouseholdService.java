package com.nido.backend.service;

import com.nido.backend.dto.HouseholdRequest;
import com.nido.backend.dto.HouseholdResponse;
import com.nido.backend.dto.InvitationResponse;
import com.nido.backend.entity.Category;
import com.nido.backend.entity.Household;
import com.nido.backend.entity.HouseholdInvitation;
import com.nido.backend.entity.HouseholdMember;
import com.nido.backend.entity.Item;
import com.nido.backend.entity.Location;
import com.nido.backend.entity.Stock;
import com.nido.backend.entity.User;
import com.nido.backend.exception.AccessDeniedDomainException;
import com.nido.backend.repository.CategoryRepository;
import com.nido.backend.repository.HouseholdInvitationRepository;
import com.nido.backend.repository.HouseholdMemberRepository;
import com.nido.backend.repository.HouseholdRepository;
import com.nido.backend.repository.ItemRepository;
import com.nido.backend.repository.LocationRepository;
import com.nido.backend.repository.StockRepository;
import com.nido.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final com.nido.backend.repository.LocationRepository locationRepository;
    private final com.nido.backend.repository.ItemRepository itemRepository;
    private final com.nido.backend.repository.CategoryRepository categoryRepository;
    private final com.nido.backend.repository.StockRepository stockRepository;
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    public HouseholdService(HouseholdRepository householdRepository,
                            HouseholdMemberRepository memberRepository,
                            HouseholdInvitationRepository invitationRepository,
                            UserRepository userRepository,
                            com.nido.backend.repository.LocationRepository locationRepository,
                            com.nido.backend.repository.ItemRepository itemRepository,
                            com.nido.backend.repository.CategoryRepository categoryRepository,
                            com.nido.backend.repository.StockRepository stockRepository) {
        this.householdRepository = householdRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.stockRepository = stockRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new AccessDeniedDomainException("Usuario no autenticado"));
    }

    @Transactional(readOnly = true)
    public List<HouseholdResponse> getUserHouseholds(String userEmail) {
        User user = getUserByEmail(userEmail);
        return memberRepository.findByUserId(user.getId()).stream()
                .map(m -> new HouseholdResponse(
                        m.getHousehold().getId(),
                        m.getHousehold().getName(),
                        m.getRole().name(),
                        m.getJoinedAt(),
                        m.getHousehold().getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public HouseholdResponse createHousehold(HouseholdRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Household household = new Household(request.name().trim());
        household = householdRepository.save(household);

        HouseholdMember member = new HouseholdMember(household, user, HouseholdMember.Role.OWNER);
        member = memberRepository.save(member);

        return new HouseholdResponse(
                household.getId(),
                household.getName(),
                member.getRole().name(),
                member.getJoinedAt(),
                household.getCreatedAt()
        );
    }

    @Transactional
    public HouseholdResponse updateHousehold(Long householdId, HouseholdRequest request, String userEmail) {
        assertUserIsMember(householdId, userEmail);
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));
        household.setName(request.name().trim());
        HouseholdMember member = memberRepository.findByHouseholdIdAndUserId(householdId, getUserByEmail(userEmail).getId())
                .orElseThrow();
        return new HouseholdResponse(
                household.getId(),
                household.getName(),
                member.getRole().name(),
                member.getJoinedAt(),
                household.getCreatedAt()
        );
    }

    @Transactional
    public InvitationResponse createInvitation(Long householdId, String userEmail) {
        assertUserIsMember(householdId, userEmail);
        User user = getUserByEmail(userEmail);
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        String code = generateCode(8);
        Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        HouseholdInvitation invitation = new HouseholdInvitation(household, code, user, expiresAt);
        invitation = invitationRepository.save(invitation);

        return new InvitationResponse(
                invitation.getId(),
                household.getId(),
                household.getName(),
                invitation.getCode(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }

    @Transactional
    public HouseholdResponse joinHousehold(String code, String userEmail) {
        User user = getUserByEmail(userEmail);
        HouseholdInvitation invitation = invitationRepository.findByCode(code.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Código de invitación inválido"));

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("El código de invitación ha caducado");
        }

        Household household = invitation.getHousehold();
        if (memberRepository.existsByHouseholdIdAndUserId(household.getId(), user.getId())) {
            throw new IllegalArgumentException("Ya eres miembro de este hogar");
        }

        HouseholdMember member = new HouseholdMember(household, user, HouseholdMember.Role.MEMBER);
        member = memberRepository.save(member);

        return new HouseholdResponse(
                household.getId(),
                household.getName(),
                member.getRole().name(),
                member.getJoinedAt(),
                household.getCreatedAt()
        );
    }

    public void assertUserIsMember(Long householdId, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (!memberRepository.existsByHouseholdIdAndUserId(householdId, user.getId())) {
            throw new AccessDeniedDomainException("No tienes permiso para acceder a este hogar");
        }
    }

    @Transactional
    public void populateStarterData(Long householdId, String userEmail) {
        assertUserIsMember(householdId, userEmail);
        Household household = householdRepository.findById(householdId).orElseThrow();

        // Si ya tiene ubicaciones, usamos las existentes o creamos
        List<com.nido.backend.entity.Location> locs = locationRepository.findByHouseholdIdAndArchivedAtIsNull(householdId);
        com.nido.backend.entity.Location despensa = locs.stream().filter(l -> l.getName().equalsIgnoreCase("Despensa")).findFirst().orElse(null);
        com.nido.backend.entity.Location nevera = locs.stream().filter(l -> l.getName().equalsIgnoreCase("Nevera")).findFirst().orElse(null);
        com.nido.backend.entity.Location armario = locs.stream().filter(l -> l.getName().equalsIgnoreCase("Armario")).findFirst().orElse(null);

        if (despensa == null || nevera == null) {
            com.nido.backend.entity.Location cocina = locs.stream().filter(l -> l.getName().equalsIgnoreCase("Cocina")).findFirst()
                    .orElseGet(() -> locationRepository.save(new com.nido.backend.entity.Location(household, null, "Cocina")));
            if (despensa == null) despensa = locationRepository.save(new com.nido.backend.entity.Location(household, cocina, "Despensa"));
            if (nevera == null) nevera = locationRepository.save(new com.nido.backend.entity.Location(household, cocina, "Nevera"));
        }

        if (armario == null) {
            com.nido.backend.entity.Location dormitorio = locs.stream().filter(l -> l.getName().equalsIgnoreCase("Dormitorio")).findFirst()
                    .orElseGet(() -> locationRepository.save(new com.nido.backend.entity.Location(household, null, "Dormitorio")));
            armario = locationRepository.save(new com.nido.backend.entity.Location(household, dormitorio, "Armario"));
        }

        com.nido.backend.entity.Category alimentos = categoryRepository.findByName("Alimentos").orElse(null);
        com.nido.backend.entity.Category limpieza = categoryRepository.findByName("Limpieza").orElse(null);
        com.nido.backend.entity.Category ropa = categoryRepository.findByName("Ropa").orElse(null);

        if (alimentos != null) {
            com.nido.backend.entity.Item arroz = itemRepository.save(new com.nido.backend.entity.Item(household, alimentos, "Arroz redondo", "Arroz blanco de grano redondo para uso diario", com.nido.backend.entity.Item.ItemType.CONSUMABLE, 2, "paquetes", null, null));
            stockRepository.save(new com.nido.backend.entity.Stock(arroz, despensa, 3, "L-2026-A", java.time.LocalDate.now().plusMonths(8)));

            com.nido.backend.entity.Item leche = itemRepository.save(new com.nido.backend.entity.Item(household, alimentos, "Leche entera", "Leche de vaca pasteurizada entera", com.nido.backend.entity.Item.ItemType.CONSUMABLE, 4, "briks", null, null));
            stockRepository.save(new com.nido.backend.entity.Stock(leche, nevera, 2, "L-2026-L", java.time.LocalDate.now().plusDays(4)));

            com.nido.backend.entity.Item huevos = itemRepository.save(new com.nido.backend.entity.Item(household, alimentos, "Huevos camperos", "Huevos de gallinas camperas docena", com.nido.backend.entity.Item.ItemType.CONSUMABLE, 1, "docenas", null, null));
            stockRepository.save(new com.nido.backend.entity.Stock(huevos, nevera, 1, "L-2026-H", java.time.LocalDate.now().plusDays(10)));

            com.nido.backend.entity.Item pasta = itemRepository.save(new com.nido.backend.entity.Item(household, alimentos, "Pasta espaguetis", "Espaguetis de trigo duro", com.nido.backend.entity.Item.ItemType.CONSUMABLE, 2, "paquetes", null, null));
            stockRepository.save(new com.nido.backend.entity.Stock(pasta, despensa, 1, "L-2026-P", java.time.LocalDate.now().plusMonths(6)));
        }

        if (limpieza != null) {
            com.nido.backend.entity.Item lavavajillas = itemRepository.save(new com.nido.backend.entity.Item(household, limpieza, "Lavavajillas concentrado", "Detergente para lavado a mano de vajilla", com.nido.backend.entity.Item.ItemType.CONSUMABLE, 1, "botes", null, null));
            stockRepository.save(new com.nido.backend.entity.Stock(lavavajillas, despensa, 2, null, null));
        }

        if (ropa != null) {
            com.nido.backend.entity.Item camisa = new com.nido.backend.entity.Item(household, ropa, "Camisa de lino blanca", "Camisa fresca para primavera/verano", com.nido.backend.entity.Item.ItemType.DURABLE, null, "prendas", "L", "Blanco");
            camisa.setLastWornAt(java.time.Instant.now().minus(120, java.time.temporal.ChronoUnit.DAYS));
            itemRepository.save(camisa);
            stockRepository.save(new com.nido.backend.entity.Stock(camisa, armario, 1, null, null));
        }
    }

    private String generateCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
