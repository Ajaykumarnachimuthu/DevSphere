package com.devsphere.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = Paths.get("uploads").toAbsolutePath().toUri().toString();
        // Ensure trailing slash
        if (!uploadDir.endsWith("/")) {
            uploadDir += "/";
        }

        File dir = new File("uploads");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir)
                .setCachePeriod(3600);
    }
}
