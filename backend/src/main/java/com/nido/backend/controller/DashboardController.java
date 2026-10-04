package com.nido.backend.controller;

import com.nido.backend.dto.DashboardSummaryResponse;
import com.nido.backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/households/{householdId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(@PathVariable Long householdId,
                                               @RequestParam(required = false, defaultValue = "90") int unwornDays,
                                               Principal principal) {
        return dashboardService.getSummary(householdId, unwornDays, principal.getName());
    }
}
