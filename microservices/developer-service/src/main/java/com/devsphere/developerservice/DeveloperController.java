package com.devsphere.developerservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/developers")
public class DeveloperController {

    private final DeveloperService developerService;

    public DeveloperController(DeveloperService developerService) {
        this.developerService = developerService;
    }

    @GetMapping
    public List<DeveloperProfile> getDevelopers(@RequestParam(required = false) String query) {
        return developerService.getDevelopers(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeveloperProfile> getDeveloperById(@PathVariable UUID id) {
        return developerService.getDeveloperById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-name")
    public ResponseEntity<DeveloperProfile> getDeveloperByName(@RequestParam String name) {
        return developerService.getDeveloperByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getDeveloperStats(@PathVariable UUID id) {
        return ResponseEntity.ok(developerService.getDeveloperStats(id));
    }

    @PostMapping
    public ResponseEntity<DeveloperProfile> createDeveloper(@RequestBody DeveloperProfile profile) {
        DeveloperProfile saved = developerService.saveDeveloper(profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
