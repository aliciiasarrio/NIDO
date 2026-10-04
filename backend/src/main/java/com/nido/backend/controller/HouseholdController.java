package com.nido.backend.controller;

import com.nido.backend.dto.HouseholdRequest;
import com.nido.backend.dto.HouseholdResponse;
import com.nido.backend.dto.InvitationResponse;
import com.nido.backend.dto.JoinHouseholdRequest;
import com.nido.backend.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @GetMapping
    public List<HouseholdResponse> getHouseholds(Principal principal) {
        return householdService.getUserHouseholds(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdResponse createHousehold(@Valid @RequestBody HouseholdRequest request, Principal principal) {
        return householdService.createHousehold(request, principal.getName());
    }

    @PutMapping("/{id}")
    public HouseholdResponse updateHousehold(@PathVariable Long id,
                                             @Valid @RequestBody HouseholdRequest request,
                                             Principal principal) {
        return householdService.updateHousehold(id, request, principal.getName());
    }

    @PostMapping("/{id}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse createInvitation(@PathVariable Long id, Principal principal) {
        return householdService.createInvitation(id, principal.getName());
    }

    @PostMapping("/join")
    public HouseholdResponse joinHousehold(@Valid @RequestBody JoinHouseholdRequest request, Principal principal) {
        return householdService.joinHousehold(request.code(), principal.getName());
    }

    @PostMapping("/{id}/populate")
    @ResponseStatus(HttpStatus.OK)
    public java.util.Map<String, String> populateHousehold(@PathVariable Long id, Principal principal) {
        householdService.populateStarterData(id, principal.getName());
        return java.util.Map.of("message", "Hogar poblado con productos y ubicaciones iniciales");
    }
}
