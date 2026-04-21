package com.hisab.AuthService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hisab.AuthService.security.JwtFilter;

import jakarta.servlet.Filter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    Filter jwtFilterBean() {
        return jwtFilter;
    }
}