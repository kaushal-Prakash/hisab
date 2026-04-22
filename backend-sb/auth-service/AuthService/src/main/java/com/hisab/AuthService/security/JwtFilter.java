package com.hisab.AuthService.security;

import java.io.IOException;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtFilter implements Filter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;

        // READ FROM COOKIES (NOT HEADER)
        Cookie[] cookies = req.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {

                    String token = cookie.getValue();

                    try {
                        String userId = jwtUtil.extractUserId(token);

                        System.out.println("USER ID: " + userId); // debug

                        req.setAttribute("userId", userId);

                    } catch (Exception e) {
                        System.out.println("Invalid JWT");
                    }
                }
            }
        }

        chain.doFilter(request, response);
    }
}