package com.hisab.AuthService.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.hisab.AuthService.model.Otp;

public interface OtpRepository extends MongoRepository<Otp, String> {

    // Find OTP by email (for verification)
    Optional<Otp> findByEmail(String email);

    // Delete OTP after verification (optional but useful)
    void deleteByEmail(String email);
}