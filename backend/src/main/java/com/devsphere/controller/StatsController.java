package com.devsphere.controller;

import com.devsphere.dto.response.OverviewStatsResponse;
import com.devsphere.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@Tag(name = "Platform Statistics", description = "Endpoints for platform-wide metrics and about stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get platform overview counters (Developers, Blogs, Projects, Countries)")
    public ResponseEntity<OverviewStatsResponse> getOverviewStats() {
        OverviewStatsResponse stats = statsService.getOverviewStats();
        return ResponseEntity.ok(stats);
    }
}
