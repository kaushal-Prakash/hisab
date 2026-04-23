package com.hisab.AuthService.service;

import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;

import com.hisab.AuthService.model.User;
import com.hisab.AuthService.repository.UserRepository;
import com.hisab.AuthService.security.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
    }

    // SIGNUP
    public Map<String, String> signup(Map<String, String> body, HttpServletResponse response) {

        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(encoder.encode(password))
                .build();

        userRepository.save(user);

        String token = JwtUtil.generateToken(user.getId());

        addTokenCookie(response, token);

        return Map.of("message", "User registered");
    }

    // LOGIN
    public Map<String, String> login(Map<String, String> body, HttpServletResponse response) {

        String email = body.get("email");
        String password = body.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getId());

        addTokenCookie(response, token);

        return Map.of("message", "Login successful");
    }

    // LOGOUT
    public Map<String, String> logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return Map.of("message", "Logged out successfully");
    }

    // CHANGE NAME
    public Map<String, String> changeName(String userId, String newName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(newName);
        userRepository.save(user);

        return Map.of("message", "Name updated");
    }

    // CHANGE PASSWORD
    public Map<String, String> changePassword(String userId,
                                              String currentPassword,
                                              String newPassword) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        return Map.of("message", "Password changed");
    }

    // GET USER
    public User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // COOKIE HELPER
    private void addTokenCookie(HttpServletResponse response, String token) {

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(cookie);
    }

    // CHANGE PHOTO
    public Map<String, Object> changePhoto(String userId, MultipartFile photo) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (photo == null || photo.isEmpty()) {
            throw new RuntimeException("Photo is required");
        }

        try {
            ImageKit imageKit = ImageKit.getInstance();
            
            String fileName = user.getName() != null ? user.getName().replaceAll("[^a-zA-Z0-9_-]", "") : "user";
            fileName = fileName + "-" + System.currentTimeMillis() + ".jpg";

            FileCreateRequest fileCreateRequest = new FileCreateRequest(photo.getBytes(), fileName);
            fileCreateRequest.setFolder("/hisab-profile-photos");

            Result result = imageKit.upload(fileCreateRequest);
            String newUrl = result.getUrl();

            user.setImageUrl(newUrl);
            userRepository.save(user);

            return Map.of(
                    "message", "Photo updated successfully",
                    "imageUrl", newUrl
            );

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload photo");
        }
    }
}