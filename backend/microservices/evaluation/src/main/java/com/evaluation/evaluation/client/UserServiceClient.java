package com.evaluation.evaluation.client;

import com.evaluation.evaluation.dto.UserInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * OpenFeign client for the User microservice.
 * Allows the Evaluation service to fetch user details (name, email) by ID
 * so that when a student starts an evaluation, we save their real name and email
 * and teachers see the logged-in student's information instead of a random or empty value.
 *
 * The "user" name must match the Eureka service ID of the User microservice
 * (see user service's application.properties: spring.application.name=user).
 */
@FeignClient(name = "user")
public interface UserServiceClient {

    /**
     * Get user by ID from the User microservice.
     * Calls GET /api/users/{id}. The gateway routes /api/users/** to the user service.
     */
    @GetMapping("/api/users/{id}")
    UserInfoDto getUserById(@PathVariable("id") Long id);
}
