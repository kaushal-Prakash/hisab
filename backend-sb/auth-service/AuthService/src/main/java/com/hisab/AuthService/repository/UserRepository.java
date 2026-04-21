package com.hisab.AuthService.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.hisab.AuthService.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    // Find user by email (used in login)
    Optional<User> findByEmail(String email);

    // Check if email already exists (used in register)
    boolean existsByEmail(String email);
}