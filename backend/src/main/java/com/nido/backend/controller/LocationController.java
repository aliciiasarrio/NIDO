package com.nido.backend.controller;

import com.nido.backend.dto.LocationRequest;
import com.nido.backend.dto.LocationResponse;
import com.nido.backend.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/households/{householdId}/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<LocationResponse> getLocations(@PathVariable Long householdId,
                                               @RequestParam(required = false, defaultValue = "false") boolean includeArchived,
                                               Principal principal) {
        return locationService.getLocationsByHousehold(householdId, includeArchived, principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocationResponse createLocation(@PathVariable Long householdId,
                                           @Valid @RequestBody LocationRequest request,
                                           Principal principal) {
        return locationService.createLocation(householdId, request, principal.getName());
    }

    @PutMapping("/{id}")
    public LocationResponse updateLocation(@PathVariable Long householdId,
                                           @PathVariable Long id,
                                           @Valid @RequestBody LocationRequest request,
                                           Principal principal) {
        return locationService.updateLocation(householdId, id, request, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archiveLocation(@PathVariable Long householdId,
                                @PathVariable Long id,
                                Principal principal) {
        locationService.archiveLocation(householdId, id, principal.getName());
    }
}
