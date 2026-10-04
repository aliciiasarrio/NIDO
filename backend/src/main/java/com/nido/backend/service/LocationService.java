package com.nido.backend.service;

import com.nido.backend.dto.LocationRequest;
import com.nido.backend.dto.LocationResponse;
import com.nido.backend.entity.Household;
import com.nido.backend.entity.Location;
import com.nido.backend.repository.HouseholdRepository;
import com.nido.backend.repository.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdService householdService;

    public LocationService(LocationRepository locationRepository,
                           HouseholdRepository householdRepository,
                           HouseholdService householdService) {
        this.locationRepository = locationRepository;
        this.householdRepository = householdRepository;
        this.householdService = householdService;
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getLocationsByHousehold(Long householdId, boolean includeArchived, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        List<Location> locations = includeArchived
                ? locationRepository.findByHouseholdId(householdId)
                : locationRepository.findByHouseholdIdAndArchivedAtIsNull(householdId);

        return locations.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LocationResponse createLocation(Long householdId, LocationRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Hogar no encontrado"));

        String trimmedName = request.name().trim();
        Location parent = null;
        if (request.parentId() != null) {
            parent = locationRepository.findById(request.parentId())
                    .orElseThrow(() -> new IllegalArgumentException("Ubicación padre no encontrada"));
            if (!parent.getHousehold().getId().equals(householdId)) {
                throw new IllegalArgumentException("La ubicación padre pertenece a otro hogar");
            }
            if (parent.isArchived()) {
                throw new IllegalArgumentException("No se pueden añadir sububicaciones a una ubicación archivada");
            }
            if (locationRepository.existsByHouseholdIdAndParentIdAndArchivedAtIsNullAndNameIgnoreCase(householdId, parent.getId(), trimmedName)) {
                throw new IllegalArgumentException("Ya existe una ubicación con ese nombre dentro del mismo padre");
            }
        } else {
            if (locationRepository.existsByHouseholdIdAndParentIsNullAndArchivedAtIsNullAndNameIgnoreCase(householdId, trimmedName)) {
                throw new IllegalArgumentException("Ya existe una ubicación raíz con ese nombre en este hogar");
            }
        }

        Location location = new Location(household, parent, trimmedName);
        location = locationRepository.save(location);

        return toResponse(location);
    }

    @Transactional
    public LocationResponse updateLocation(Long householdId, Long locationId, LocationRequest request, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Ubicación no encontrada"));

        if (!location.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La ubicación no pertenece al hogar indicado");
        }

        String trimmedName = request.name().trim();
        Location newParent = null;
        if (request.parentId() != null) {
            if (request.parentId().equals(locationId)) {
                throw new IllegalArgumentException("Una ubicación no puede ser su propio padre");
            }
            newParent = locationRepository.findById(request.parentId())
                    .orElseThrow(() -> new IllegalArgumentException("Ubicación padre no encontrada"));
            if (!newParent.getHousehold().getId().equals(householdId)) {
                throw new IllegalArgumentException("La ubicación padre pertenece a otro hogar");
            }
            // Verificar ciclos recursivamente
            if (isDescendant(newParent, locationId)) {
                throw new IllegalArgumentException("No se pueden formar ciclos en la jerarquía de ubicaciones");
            }
        }

        location.setParent(newParent);
        location.setName(trimmedName);
        return toResponse(location);
    }

    @Transactional
    public void archiveLocation(Long householdId, Long locationId, String userEmail) {
        householdService.assertUserIsMember(householdId, userEmail);

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Ubicación no encontrada"));

        if (!location.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("La ubicación no pertenece al hogar indicado");
        }

        // Comprobar si tiene hijos activos
        List<Location> activeChildren = locationRepository.findByParentIdAndArchivedAtIsNull(locationId);
        if (!activeChildren.isEmpty()) {
            throw new IllegalArgumentException("No se puede archivar una ubicación que contiene sububicaciones activas");
        }

        location.setArchivedAt(Instant.now());
    }

    private boolean isDescendant(Location current, Long targetAncestorId) {
        Location p = current;
        while (p != null) {
            if (p.getId().equals(targetAncestorId)) {
                return true;
            }
            p = p.getParent();
        }
        return false;
    }

    public String buildFullPath(Location location) {
        List<String> pathParts = new ArrayList<>();
        Location current = location;
        while (current != null) {
            pathParts.add(current.getName());
            current = current.getParent();
        }
        Collections.reverse(pathParts);
        return String.join(" > ", pathParts);
    }

    private LocationResponse toResponse(Location loc) {
        return new LocationResponse(
                loc.getId(),
                loc.getHousehold().getId(),
                loc.getParent() != null ? loc.getParent().getId() : null,
                loc.getParent() != null ? loc.getParent().getName() : null,
                loc.getName(),
                buildFullPath(loc),
                loc.getArchivedAt(),
                loc.getCreatedAt()
        );
    }
}
