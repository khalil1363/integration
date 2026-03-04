# OpenFeign Integration: User ↔ Evaluation Microservices

This document explains how **OpenFeign** is used so that the **Evaluation** microservice can get the **logged-in student's real name and email** from the **User** microservice. When a student starts an evaluation, that information is saved with the attempt, and **teachers see the real student name** (not a random or empty value).

---

## 1. What Problem Does This Solve?

- **Before:** Evaluation attempts only stored `userId` (a number). To show "who" did the attempt, the frontend or evaluation service had to call another API or use a local list, which could be out of sync or show "User #123" instead of the real name.
- **After:** When a student **starts** an evaluation, the Evaluation service calls the User service (via OpenFeign), gets that user's **firstName**, **lastName**, and **email**, and **saves them on the attempt**. Teachers then see the real name and email for each attempt.

---

## 2. Architecture Overview

```
[Frontend]  →  POST /api/attempts/start/{evaluationId}?userId=5  →  [Gateway 8080]
                                                                         ↓
                                                              [Evaluation service 8020]
                                                                         ↓
                                                    EvaluationAttemptServiceImpl.startAttempt()
                                                                         ↓
                                                    UserServiceClient.getUserById(5)  ← OpenFeign
                                                                         ↓
                                                              [User service 8011]
                                                              GET /api/users/5
                                                                         ↓
                                                    Returns { id, firstName, lastName, email, ... }
                                                                         ↓
                                                    Save attempt with studentFirstName, studentLastName, studentEmail
```

- **User microservice** does **not** call Evaluation; only **Evaluation** calls **User** via OpenFeign.
- The Feign client uses **Eureka** to resolve the service name `"user"` to the actual URL (e.g. `http://localhost:8011`).

---

## 3. Code Added / Modified

### 3.1 Evaluation microservice: OpenFeign dependency

**File:** `backend/microservices/evaluation/pom.xml`

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

**Explanation:** This brings in OpenFeign and integrates it with Spring Cloud (Eureka, load balancing). No need to write HTTP client code by hand.

---

### 3.2 Enable Feign clients on the Evaluation application

**File:** `backend/microservices/evaluation/src/main/java/com/evaluation/evaluation/EvaluationApplication.java`

```java
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients   // <-- Added: scans for @FeignClient interfaces
public class EvaluationApplication {
    // ...
}
```

**Explanation:** `@EnableFeignClients` makes Spring scan for interfaces annotated with `@FeignClient` and create implementation beans that perform HTTP calls to the specified service.

---

### 3.3 DTO for user info (Evaluation side)

**File:** `backend/microservices/evaluation/src/main/java/com/evaluation/evaluation/dto/UserInfoDto.java`

```java
package com.evaluation.evaluation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
```

**Explanation:**

- The **User** microservice returns a full `User` entity (with password, etc.). We do **not** want to depend on that entity in Evaluation.
- `UserInfoDto` declares only the fields we need. Jackson will map `firstName`, `lastName`, `email` from the JSON response and **ignore** extra fields (`password`, etc.) thanks to `@JsonIgnoreProperties(ignoreUnknown = true)`.

---

### 3.4 Feign client interface

**File:** `backend/microservices/evaluation/src/main/java/com/evaluation/evaluation/client/UserServiceClient.java`

```java
package com.evaluation.evaluation.client;

import com.evaluation.evaluation.dto.UserInfoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user")
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserInfoDto getUserById(@PathVariable("id") Long id);
}
```

**Explanation:**

- `@FeignClient(name = "user")`: the logical name of the service. Spring Cloud resolves `"user"` via **Eureka** to the User microservice instance(s). The gateway is **not** involved in this server-to-server call.
- `getUserById(Long id)` will perform **GET /api/users/{id}** on the User service. The path is the same as in the User microservice’s `UserController`.
- Return type `UserInfoDto`: the response body is deserialized into this DTO.

---

### 3.5 EvaluationAttempt entity: new fields

**File:** `backend/microservices/evaluation/src/main/java/com/evaluation/evaluation/model/EvaluationAttempt.java`

New columns:

```java
@Column(name = "student_first_name", length = 100)
private String studentFirstName;

@Column(name = "student_last_name", length = 100)
private String studentLastName;

@Column(name = "student_email", length = 255)
private String studentEmail;
```

**Explanation:** These store the student’s name and email **at the time the attempt is started**. They are filled by the Evaluation service using the response from the User service. Teachers see this data when they list or open attempts; no need to call the User service again at display time.

---

### 3.6 EvaluationAttemptServiceImpl: call User service and save names

**File:** `backend/microservices/evaluation/src/main/java/com/evaluation/evaluation/service/impl/EvaluationAttemptServiceImpl.java`

- **Inject** the Feign client:

```java
private final UserServiceClient userServiceClient;
```

- In **startAttempt**, after creating the `EvaluationAttempt` and setting `userId`, **before** saving:

```java
// Fetch logged-in student's name and email from User microservice via OpenFeign
try {
    UserInfoDto userInfo = userServiceClient.getUserById(userId);
    if (userInfo != null) {
        attempt.setStudentFirstName(userInfo.getFirstName());
        attempt.setStudentLastName(userInfo.getLastName());
        attempt.setStudentEmail(userInfo.getEmail());
    }
} catch (Exception e) {
    log.warn("Could not fetch user info for userId={} from User service: {}", userId, e.getMessage());
    attempt.setStudentFirstName("Unknown");
    attempt.setStudentLastName("");
    attempt.setStudentEmail("");
}
return evaluationAttemptRepository.save(attempt);
```

**Explanation:**

- When a student starts an attempt, we call the User service with that student’s `userId` (the one who is logged in and starting the evaluation).
- If the call succeeds, we store the real **firstName**, **lastName**, and **email** on the attempt.
- If the User service is down or returns an error, we catch the exception, log a warning, and set a fallback (`"Unknown"`) so the attempt is still saved and the teacher sees something.

---

## 4. Frontend changes

- **Model:** `EvaluationAttempt` in `core/models/evaluation.model.ts` now includes optional `studentFirstName`, `studentLastName`, `studentEmail` (they come from the API when present).
- **Teacher view:** In the backoffice **evaluation-attempts** component, the display name for an attempt uses these fields first, then falls back to the previous logic (e.g. `User #id` or name from a local list):
  - New method `attemptDisplayName(a)` returns `studentFirstName + " " + studentLastName` when set, otherwise the previous `userName(a.userId)`.
  - Template uses `attemptDisplayName(a)` in the list and in the attempt detail header so teachers see the **saved student name** from the User microservice.

---

## 5. Summary

| Component | Role |
|-----------|------|
| **User microservice** | Exposes GET `/api/users/{id}`. No OpenFeign; no call to Evaluation. |
| **Evaluation microservice** | Uses **OpenFeign** (`UserServiceClient`) to call User service by name `"user"` and get user info when an attempt is **started**. Saves `studentFirstName`, `studentLastName`, `studentEmail` on `EvaluationAttempt`. |
| **Gateway** | Routes frontend calls to Evaluation and User services. The Feign call is **server-to-server** (Evaluation → User) and uses Eureka, not the gateway. |
| **Frontend** | Sends the **logged-in user’s id** when starting an attempt; teacher UI shows the name/email stored on the attempt (real student info). |

With this, **when a student logs in and makes an evaluation, the teacher sees that student’s real name and email**, stored at attempt start via OpenFeign communication from Evaluation to User microservice.
