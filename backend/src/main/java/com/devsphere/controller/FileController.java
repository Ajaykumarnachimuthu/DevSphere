package com.devsphere.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "Files", description = "Endpoints for uploading pictures and media assets")
public class FileController {

    private static final String UPLOAD_DIR = "uploads";
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml");

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload picture for blog cover, project screenshot, or avatar")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("error", "Only image formats (JPEG, PNG, WEBP, GIF, SVG) are allowed"));
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = StringUtils
                    .cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "image.png"));
            String extension = "";
            int extIdx = originalName.lastIndexOf('.');
            if (extIdx > 0) {
                extension = originalName.substring(extIdx);
            } else {
                extension = ".png";
            }

            String safeName = UUID.randomUUID().toString() + extension;
            Path targetLocation = Paths.get(UPLOAD_DIR).resolve(safeName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/" + safeName;

            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", safeName);
            response.put("originalName", originalName);
            response.put("size", file.getSize());
            response.put("contentType", contentType);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not store file: " + ex.getMessage()));
        }
    }
}
