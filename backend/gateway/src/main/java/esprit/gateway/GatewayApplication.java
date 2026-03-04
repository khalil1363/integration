package esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth + users (discovered via Eureka as "user")
                .route("user-auth", r -> r.path("/api/auth/**")
                        .uri("lb://user"))
                .route("user-users", r -> r.path("/api/users/**")
                        .uri("lb://user"))

                // Evaluation (discovered via Eureka as "evaluation")
                .route("evaluation-evaluations", r -> r.path("/api/evaluations/**")
                        .uri("lb://evaluation"))
                .route("evaluation-attempts", r -> r.path("/api/attempts/**")
                        .uri("lb://evaluation"))
                .route("evaluation-certificate", r -> r.path("/api/certificate/**")
                        .uri("lb://evaluation"))
                .route("evaluation-reading-questions", r -> r.path("/api/reading-questions/**")
                        .uri("lb://evaluation"))
                .route("evaluation-fillblank-questions", r -> r.path("/api/fillblank-questions/**")
                        .uri("lb://evaluation"))
                .route("evaluation-msq-questions", r -> r.path("/api/msq-questions/**")
                        .uri("lb://evaluation"))
                .route("evaluation-mcq-questions", r -> r.path("/api/mcq-questions/**")
                        .uri("lb://evaluation"))
                .route("evaluation-writing-questions", r -> r.path("/api/writing-questions/**")
                        .uri("lb://evaluation"))
                // Serve uploaded files (photo, PDF) so frontend can display them
                .route("evaluation-uploads", r -> r.path("/uploads/**")
                        .uri("lb://evaluation"))
                .build();
    }
}
