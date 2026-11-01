package com.devsphere.service.impl;

import com.devsphere.dto.response.OverviewStatsResponse;
import com.devsphere.entity.BlogStatus;
import com.devsphere.repository.BlogRepository;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.service.StatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsServiceImpl implements StatsService {

    private final DeveloperProfileRepository developerRepository;
    private final BlogRepository blogRepository;
    private final ProjectRepository projectRepository;

    public StatsServiceImpl(
            DeveloperProfileRepository developerRepository,
            BlogRepository blogRepository,
            ProjectRepository projectRepository
    ) {
        this.developerRepository = developerRepository;
        this.blogRepository = blogRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public OverviewStatsResponse getOverviewStats() {
        long devDbCount = developerRepository.count();
        long blogDbCount = blogRepository.countByStatus(BlogStatus.PUBLISHED);
        long projDbCount = projectRepository.count();
        long countriesCount = developerRepository.countDistinctLocations();
        if (countriesCount == 0 && devDbCount > 0) {
            countriesCount = 1L;
        }

        return new OverviewStatsResponse(devDbCount, blogDbCount, projDbCount, countriesCount);
    }
}
