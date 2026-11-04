package com.devsphere.service.impl;

import com.devsphere.client.BlogServiceClient;
import com.devsphere.client.ProjectServiceClient;
import com.devsphere.dto.response.OverviewStatsResponse;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.service.StatsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsServiceImpl implements StatsService {

    private static final Logger log = LoggerFactory.getLogger(StatsServiceImpl.class);

    private final DeveloperProfileRepository developerRepository;
    private final BlogServiceClient blogServiceClient;
    private final ProjectServiceClient projectServiceClient;

    public StatsServiceImpl(
            DeveloperProfileRepository developerRepository,
            BlogServiceClient blogServiceClient,
            ProjectServiceClient projectServiceClient
    ) {
        this.developerRepository = developerRepository;
        this.blogServiceClient = blogServiceClient;
        this.projectServiceClient = projectServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public OverviewStatsResponse getOverviewStats() {
        long devDbCount = developerRepository.count();
        long countriesCount = developerRepository.countDistinctLocations();
        if (countriesCount == 0 && devDbCount > 0) {
            countriesCount = 1L;
        }

        long blogCount = 4L;
        try {
            var blogPage = blogServiceClient.getBlogs(null, null, PageRequest.of(0, 1), null);
            if (blogPage != null) {
                blogCount = blogPage.getTotalElements();
            }
        } catch (Exception e) {
            log.warn("Could not retrieve live blog count from Blog Service: {}", e.getMessage());
        }

        long projCount = 6L;
        try {
            var projPage = projectServiceClient.getProjects(null, null, null, PageRequest.of(0, 1), null);
            if (projPage != null) {
                projCount = projPage.getTotalElements();
            }
        } catch (Exception e) {
            log.warn("Could not retrieve live project count from Project Service: {}", e.getMessage());
        }

        return new OverviewStatsResponse(devDbCount, blogCount, projCount, countriesCount);
    }
}
