package com.devsphere.service.impl;

import com.devsphere.dto.request.UpdateDeveloperProfileRequest;
import com.devsphere.dto.response.ConnectionStatusResponse;
import com.devsphere.dto.response.DeveloperResponse;
import com.devsphere.dto.response.DeveloperStatsResponse;
import com.devsphere.dto.response.PagedResponse;
import com.devsphere.entity.BlogStatus;
import com.devsphere.entity.DeveloperConnection;
import com.devsphere.entity.DeveloperProfile;
import com.devsphere.entity.User;
import com.devsphere.exception.ResourceNotFoundException;
import com.devsphere.exception.UnauthorizedException;
import com.devsphere.mapper.EntityDtoMapper;
import com.devsphere.repository.BlogRepository;
import com.devsphere.repository.DeveloperConnectionRepository;
import com.devsphere.repository.DeveloperProfileRepository;
import com.devsphere.repository.ProjectRepository;
import com.devsphere.repository.UserRepository;
import com.devsphere.service.DeveloperService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeveloperServiceImpl implements DeveloperService {

    private final DeveloperProfileRepository developerRepository;
    private final DeveloperConnectionRepository connectionRepository;
    private final ProjectRepository projectRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;

    public DeveloperServiceImpl(
            DeveloperProfileRepository developerRepository,
            DeveloperConnectionRepository connectionRepository,
            ProjectRepository projectRepository,
            BlogRepository blogRepository,
            UserRepository userRepository,
            EntityDtoMapper mapper
    ) {
        this.developerRepository = developerRepository;
        this.connectionRepository = connectionRepository;
        this.projectRepository = projectRepository;
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeveloperResponse> getDevelopers(String query, Pageable pageable, UUID currentUserId) {
        Page<DeveloperProfile> page = developerRepository.searchDevelopers(query, pageable);
        List<DeveloperProfile> developers = page.getContent();

        if (developers.isEmpty()) {
            return new PagedResponse<>(
                    Collections.emptyList(),
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages(),
                    page.isLast()
            );
        }

        // Batch count queries to eliminate N+1 queries
        List<UUID> devIds = developers.stream().map(DeveloperProfile::getId).toList();
        Map<UUID, Long> connectionCounts = toCountMap(connectionRepository.countByDeveloperIds(devIds));

        Set<UUID> connectedDevIds = (currentUserId != null)
                ? new HashSet<>(connectionRepository.findConnectedDeveloperIds(devIds, currentUserId))
                : Collections.emptySet();

        List<UUID> userIds = developers.stream()
                .map(d -> d.getUser() != null ? d.getUser().getId() : null)
                .filter(Objects::nonNull)
                .toList();

        Map<UUID, Long> projectCounts = userIds.isEmpty() ? Collections.emptyMap() : toCountMap(projectRepository.countByAuthorIds(userIds));
        Map<UUID, Long> blogCounts = userIds.isEmpty() ? Collections.emptyMap() : toCountMap(blogRepository.countByAuthorIdsAndStatus(userIds, BlogStatus.PUBLISHED));

        List<DeveloperResponse> content = developers.stream().map(dev -> {
            boolean connected = connectedDevIds.contains(dev.getId());
            int totalConnections = connectionCounts.getOrDefault(dev.getId(), 0L).intValue();
            int projCount;
            int blgCount;

            if (dev.getUser() != null) {
                projCount = projectCounts.getOrDefault(dev.getUser().getId(), 0L).intValue();
                blgCount = blogCounts.getOrDefault(dev.getUser().getId(), 0L).intValue();
            } else {
                projCount = (int) projectRepository.countByAuthorNameIgnoreCase(dev.getName());
                blgCount = (int) blogRepository.countByAuthorNameIgnoreCaseAndStatus(dev.getName(), BlogStatus.PUBLISHED);
            }

            return mapper.toDeveloperResponse(dev, projCount, blgCount, totalConnections, connected);
        }).toList();

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DeveloperResponse getDeveloperById(UUID id, UUID currentUserId) {
        DeveloperProfile dev = developerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + id));
        return toDeveloperResponseWithStats(dev, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public DeveloperResponse getDeveloperByName(String name, UUID currentUserId) {
        DeveloperProfile dev = developerRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with name: " + name));
        return toDeveloperResponseWithStats(dev, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public DeveloperResponse getMyProfile(UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to view profile");
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DeveloperProfile profile = developerRepository.findByUserId(currentUserId)
                .orElseGet(() -> {
                    DeveloperProfile newProfile = new DeveloperProfile(
                            user.getUsername(),
                            "Developer",
                            "New developer on DEVSphere. Passionate about learning and building.",
                            "Worldwide",
                            "a" + ((Math.abs(user.getUsername().hashCode()) % 6) + 1),
                            Set.of("Web Development")
                    );
                    newProfile.setUser(user);
                    return developerRepository.save(newProfile);
                });

        return toDeveloperResponseWithStats(profile, currentUserId);
    }

    @Override
    @Transactional
    public DeveloperResponse updateMyProfile(UUID currentUserId, UpdateDeveloperProfileRequest request) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to update profile");
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DeveloperProfile profile = developerRepository.findByUserId(currentUserId)
                .orElseGet(() -> {
                    DeveloperProfile newProfile = new DeveloperProfile(
                            user.getUsername(),
                            "Developer",
                            "New developer on DEVSphere.",
                            "Worldwide",
                            "a1",
                            new HashSet<>()
                    );
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (request.getName() != null && !request.getName().isBlank()) {
            profile.setName(request.getName().trim());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            profile.setRole(request.getRole().trim());
        }
        if (request.getDescription() != null) {
            profile.setDescription(request.getDescription().trim());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation().trim());
        }
        if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
            profile.setAvatar(request.getAvatar().trim());
        }
        if (request.getSkills() != null) {
            Set<String> cleanSkills = request.getSkills().stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toSet());
            profile.setSkills(cleanSkills);
        }

        DeveloperProfile saved = developerRepository.save(profile);
        return toDeveloperResponseWithStats(saved, currentUserId);
    }

    @Override
    @Transactional
    public ConnectionStatusResponse toggleConnection(UUID developerId, UUID currentUserId) {
        if (currentUserId == null) {
            throw new UnauthorizedException("Authentication required to connect with developers");
        }

        DeveloperProfile developer = developerRepository.findById(developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<DeveloperConnection> existing = connectionRepository.findByDeveloperIdAndUserId(developerId, currentUserId);
        boolean connected;

        if (existing.isPresent()) {
            connectionRepository.delete(existing.get());
            connected = false;
        } else {
            DeveloperConnection connection = new DeveloperConnection(developer, user);
            connectionRepository.save(connection);
            connected = true;
        }

        int totalConnections = (int) connectionRepository.countByDeveloperId(developerId);
        return new ConnectionStatusResponse(developerId, connected, totalConnections);
    }

    @Override
    @Transactional(readOnly = true)
    public DeveloperStatsResponse getDeveloperStats(UUID developerId) {
        DeveloperProfile dev = developerRepository.findById(developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found with id: " + developerId));

        int connectionsCount = (int) connectionRepository.countByDeveloperId(developerId);
        int projectsCount = 0;
        int blogsCount = 0;

        if (dev.getUser() != null) {
            projectsCount = (int) projectRepository.countByAuthorId(dev.getUser().getId());
            blogsCount = (int) blogRepository.countByAuthorIdAndStatus(dev.getUser().getId(), BlogStatus.PUBLISHED);
        } else {
            projectsCount = (int) projectRepository.countByAuthorNameIgnoreCase(dev.getName());
            blogsCount = (int) blogRepository.countByAuthorNameIgnoreCaseAndStatus(dev.getName(), BlogStatus.PUBLISHED);
        }

        List<Integer> activityData = List.of(projectsCount, blogsCount, connectionsCount);
        List<String> activityLabels = List.of("Projects", "Blogs", "Connections");

        return new DeveloperStatsResponse(projectsCount, blogsCount, connectionsCount, activityData, activityLabels);
    }

    private DeveloperResponse toDeveloperResponseWithStats(DeveloperProfile dev, UUID currentUserId) {
        boolean connected = false;
        if (currentUserId != null) {
            connected = connectionRepository.existsByDeveloperIdAndUserId(dev.getId(), currentUserId);
        }
        int totalConnections = (int) connectionRepository.countByDeveloperId(dev.getId());
        int projectsCount = 0;
        int blogsCount = 0;

        if (dev.getUser() != null) {
            projectsCount = (int) projectRepository.countByAuthorId(dev.getUser().getId());
            blogsCount = (int) blogRepository.countByAuthorIdAndStatus(dev.getUser().getId(), BlogStatus.PUBLISHED);
        } else {
            projectsCount = (int) projectRepository.countByAuthorNameIgnoreCase(dev.getName());
            blogsCount = (int) blogRepository.countByAuthorNameIgnoreCaseAndStatus(dev.getName(), BlogStatus.PUBLISHED);
        }

        return mapper.toDeveloperResponse(dev, projectsCount, blogsCount, totalConnections, connected);
    }

    private Map<UUID, Long> toCountMap(List<Object[]> results) {
        if (results == null) return Collections.emptyMap();
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] row : results) {
            if (row != null && row.length >= 2 && row[0] instanceof UUID id && row[1] instanceof Number count) {
                map.put(id, count.longValue());
            }
        }
        return map;
    }
}
