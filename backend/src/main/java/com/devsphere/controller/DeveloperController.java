package com.devsphere.controller;

import com.devsphere.dto.request.UpdateDeveloperProfileRequest;
import com.devsphere.dto.response.ConnectionStatusResponse;
import com.devsphere.dto.response.DeveloperResponse;
import com.devsphere.dto.response.DeveloperStatsResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.security.UserPrincipal;
import com.devsphere.service.DeveloperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/developers")
@Tag(name = "Developers", description = "Endpoints for discovering developers, profiles, and connections")
public class DeveloperController {

    private final DeveloperService developerService;

    public DeveloperController(DeveloperService developerService) {
        this.developerService = developerService;
    }

    @GetMapping
    @Operation(summary = "Get paginated developer list with search filter")
    public ResponseEntity<PagedResponse<DeveloperResponse>> getDevelopers(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        PagedResponse<DeveloperResponse> response = developerService.getDevelopers(query, pageable, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get authenticated developer profile")
    public ResponseEntity<DeveloperResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            user = up;
        }
        if (user == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        DeveloperResponse response = developerService.getMyProfile(user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated developer profile")
    public ResponseEntity<DeveloperResponse> updateMyProfile(
            @Valid @RequestBody UpdateDeveloperProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            Authentication authentication
    ) {
        UserPrincipal user = principal;
        if (user == null && authentication != null && authentication.getPrincipal() instanceof UserPrincipal up) {
            user = up;
        }
        if (user == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        DeveloperResponse response = developerService.updateMyProfile(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-name")
    @Operation(summary = "Get developer profile by full name")
    public ResponseEntity<DeveloperResponse> getDeveloperByName(
            @RequestParam String name,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        DeveloperResponse response = developerService.getDeveloperByName(name, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get developer profile by ID")
    public ResponseEntity<DeveloperResponse> getDeveloperById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        DeveloperResponse response = developerService.getDeveloperById(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/connect")
    @Operation(summary = "Toggle connection with a developer (Authenticated)")
    public ResponseEntity<ConnectionStatusResponse> toggleConnection(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentUserId = principal != null ? principal.getId() : null;
        ConnectionStatusResponse response = developerService.toggleConnection(id, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get developer activity breakdown stats")
    public ResponseEntity<DeveloperStatsResponse> getDeveloperStats(@PathVariable UUID id) {
        DeveloperStatsResponse response = developerService.getDeveloperStats(id);
        return ResponseEntity.ok(response);
    }
}
