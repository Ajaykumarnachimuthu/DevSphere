package com.devsphere.service;

import com.devsphere.dto.response.ConnectionStatusResponse;
import com.devsphere.dto.response.DeveloperResponse;
import com.devsphere.dto.response.DeveloperStatsResponse;
import com.devsphere.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DeveloperService {

    PagedResponse<DeveloperResponse> getDevelopers(String query, Pageable pageable, UUID currentUserId);

    DeveloperResponse getDeveloperById(UUID id, UUID currentUserId);

    DeveloperResponse getDeveloperByName(String name, UUID currentUserId);

    ConnectionStatusResponse toggleConnection(UUID developerId, UUID currentUserId);

    DeveloperStatsResponse getDeveloperStats(UUID developerId);

    DeveloperResponse updateMyProfile(UUID currentUserId, com.devsphere.dto.request.UpdateDeveloperProfileRequest request);

    DeveloperResponse getMyProfile(UUID currentUserId);
}
