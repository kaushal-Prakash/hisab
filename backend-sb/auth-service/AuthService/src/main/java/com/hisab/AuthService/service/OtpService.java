package com.hisab.AuthService.service;

import java.util.Map;
import java.util.Random;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.hisab.AuthService.model.Otp;
import com.hisab.AuthService.repository.OtpRepository;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    public Map<String, String> createOtp(String email) {

        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        String hashedOtp = encoder.encode(otp);

        otpRepository.deleteByEmail(email);

        otpRepository.save(
                Otp.builder()
                        .email(email)
                        .otp(hashedOtp)
                        .build()
        );

        // 👉 Replace with email sending later
        System.out.println("OTP: " + otp);

        return Map.of("message", "OTP sent");
    }

    public Map<String, String> verifyOtp(String email, String otp) {

        Otp existing = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!encoder.matches(otp, existing.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        otpRepository.deleteByEmail(email);

        return Map.of("message", "OTP verified");
    }
}