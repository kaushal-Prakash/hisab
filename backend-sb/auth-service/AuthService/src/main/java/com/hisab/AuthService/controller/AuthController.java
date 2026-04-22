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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    // SIGNUP
    @PostMapping("/signup")
    public Map<String, String> signup(@RequestBody Map<String, String> body,
                                      HttpServletResponse response) {
        return authService.signup(body, response);
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body,
                                     HttpServletResponse response) {
        return authService.login(body, response);
    }

    // LOGOUT
    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletResponse response) {
        return authService.logout(response);
    }

    // CHANGE NAME (uses JWT, not request param)
    @PostMapping("/change-name")
    public Map<String, String> changeName(HttpServletRequest request,
                                          @RequestBody Map<String, String> body) {
        String userId = (String) request.getAttribute("userId");
        return authService.changeName(userId, body.get("newName"));
    }

    // CHANGE PASSWORD
    @PostMapping("/change-password")
    public Map<String, String> changePassword(HttpServletRequest request,
                                              @RequestBody Map<String, String> body) {
        String userId = (String) request.getAttribute("userId");

        return authService.changePassword(
                userId,
                body.get("currentPassword"),
                body.get("newPassword")
        );
    }

    // OTP
    @GetMapping("/create-otp")
    public Map<String, String> createOtp(@RequestParam String email) {
        return otpService.createOtp(email);
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestBody Map<String, String> body) {
        return otpService.verifyOtp(body.get("email"), body.get("otp"));
    }

    // GET USER (SECURE)
    @GetMapping("/get-user")
    public Object getUser(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return authService.getUser(userId);
    }
}