package com.hisab.AuthService.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "otp")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Otp {

    @Id
    private String id;

    private String email;

    private String otp;

    @Indexed(expireAfter = "600s") // TTL: auto delete after 10 minutes
    @Builder.Default
    private Instant createdAt = Instant.now();
}