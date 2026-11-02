package com.devsphere.config;

import com.devsphere.security.CustomUserDetailsService;
import com.devsphere.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final List<String> allowedOrigins;

    public SecurityConfig(
            @org.springframework.context.annotation.Lazy JwtAuthenticationFilter jwtAuthenticationFilter,
            @org.springframework.context.annotation.Lazy CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            @Value("${devsphere.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}") String allowedOriginsStr
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.allowedOrigins = Arrays.stream(allowedOriginsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        java.util.List<String> patterns = new java.util.ArrayList<>(java.util.List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://*.vercel.app",
                "https://*.onrender.com"
        ));
        if (allowedOrigins != null) {
            for (String origin : allowedOrigins) {
                if (!patterns.contains(origin)) {
                    patterns.add(origin);
                }
            }
        }
        configuration.setAllowedOriginPatterns(patterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .authorizeHttpRequests(auth -> auth
                        // Always permit CORS preflight OPTIONS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public Auth Endpoints
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login").permitAll()

                        // Explicitly Protected Endpoints before wildcards
                        .requestMatchers(HttpMethod.GET, "/api/v1/blogs/drafts").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/developers/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/developers/*/connect").authenticated()
                        
                        // Public Read Endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/developers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/blogs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/view").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/stats/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // File Upload (Authenticated)
                        .requestMatchers(HttpMethod.POST, "/api/v1/files/upload").authenticated()

                        // Swagger, Error & Documentation & H2 Console
                        .requestMatchers(
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/h2-console/**",
                                "/favicon.ico"
                        ).permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
