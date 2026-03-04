package com.evaluation.evaluation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Lightweight user info returned by the User microservice (GET /api/users/{id}).
 * Used by the Evaluation service via OpenFeign to display the student's name and email
 * when a teacher views attempts. Only the fields we need are declared; extra fields
 * (e.g. password) from the User entity are ignored.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
