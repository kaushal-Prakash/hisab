package com.hisab.AuthService.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hisab.AuthService.service.AuthService;
import com.hisab.AuthService.service.OtpService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/signup")
    public Map<String, String> signup(@RequestBody Map<String, String> body) {
        return authService.signup(body);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        return authService.login(body);
    }

    @PostMapping("/change-name")
    public Map<String, String> changeName(@RequestParam String userId,
                                          @RequestBody Map<String, String> body) {
        return authService.changeName(userId, body.get("newName"));
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(@RequestParam String userId,
                                              @RequestBody Map<String, String> body) {
        return authService.changePassword(userId,
                body.get("currentPassword"),
                body.get("newPassword"));
    }

    @GetMapping("/create-otp")
    public Map<String, String> createOtp(@RequestParam String email) {
        return otpService.createOtp(email);
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestBody Map<String, String> body) {
        return otpService.verifyOtp(body.get("email"), body.get("otp"));
    }

    @GetMapping("/get-user")
    public Object getUser(@RequestParam String userId) {
        return authService.getUser(userId);
    }
}