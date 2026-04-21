package com.hisab.AuthService.service;

import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.hisab.AuthService.model.User;
import com.hisab.AuthService.repository.UserRepository;
import com.hisab.AuthService.security.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, String> signup(Map<String, String> body) {

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

        return Map.of("message", "User registered");
    }

    public Map<String, String> login(Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getId());

        return Map.of(
                "message", "Login successful",
                "token", token
        );
    }

    public Map<String, String> changeName(String userId, String newName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(newName);
        userRepository.save(user);

        return Map.of("message", "Name updated");
    }

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

    public User getUser(String userId) {
        return userRepository.findById(userId).orElse(null);
    }
}