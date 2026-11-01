package com.devsphere.developerservice;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeveloperService {

    private final DeveloperProfileRepository developerRepository;

    public DeveloperService(DeveloperProfileRepository developerRepository) {
        this.developerRepository = developerRepository;
    }

    public List<DeveloperProfile> getDevelopers(String query) {
        if (query != null && !query.isBlank()) {
            return developerRepository.searchDevelopers(query.trim());
        }
        return developerRepository.findAll();
    }

    public Optional<DeveloperProfile> getDeveloperById(UUID id) {
        return developerRepository.findById(id);
    }

    public Optional<DeveloperProfile> getDeveloperByName(String name) {
        return developerRepository.findByNameIgnoreCase(name);
    }

    public DeveloperProfile saveDeveloper(DeveloperProfile profile) {
        return developerRepository.save(profile);
    }

    public Map<String, Object> getDeveloperStats(UUID id) {
        return Map.of(
                "developerId", id,
                "connections", 24,
                "projectsCount", 5,
                "views", 1280
        );
    }
}
