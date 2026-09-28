package com.neurolink.NeuroLink.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // Enable CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Disable CSRF for REST API
                                .csrf(AbstractHttpConfigurer::disable)

                                // Disable Spring's default login page
                                .formLogin(AbstractHttpConfigurer::disable)

                                // Disable HTTP Basic authentication
                                .httpBasic(AbstractHttpConfigurer::disable)

                                // Authorization rules
                                .authorizeHttpRequests(auth -> auth

                                                // Allow CORS preflight requests
                                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                                .permitAll()

                                                // User APIs
                                                .requestMatchers("/api/users/**")
                                                .permitAll()

                                                // Memory APIs
                                                .requestMatchers("/api/memories/**")
                                                .permitAll()

                                                // Error page dispatching
                                                .requestMatchers("/error")
                                                .permitAll()

                                                // Everything else
                                                .anyRequest()
                                                .permitAll());

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                /*
                 * Allow requests from any frontend origin.
                 */
                configuration.setAllowedOriginPatterns(List.of("*"));

                /*
                 * Allow all common HTTP methods.
                 */
                configuration.setAllowedMethods(List.of(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "OPTIONS",
                                "HEAD",
                                "PATCH"));

                configuration.setAllowedHeaders(List.of("*"));
                configuration.setExposedHeaders(List.of("*"));

                configuration.setAllowCredentials(false);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}