# strayLove Backend

A comprehensive Spring Boot backend for the strayLove application, designed to help stray animals find care and support through community reporting and tracking.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (PUBLIC_USER, VOLUNTEER, ADMIN)
- **Animal Management**: Report, track, and update information about animals with approval workflow
- **Care Management**: Record vaccinations, sterilizations, feeding, and medical treatments
- **Location-based Services**: Find animals within specified radius using coordinates
- **Community Engagement**: Add logs, upvote posts, and track community interactions
- **Donation System**: Create campaigns and manage donations with payment integration
- **Image Upload**: Support for animal photos (Cloudinary integration ready)
- **RESTful APIs**: Clean, documented APIs with Swagger/OpenAPI
- **Pagination**: Efficient data retrieval with pagination support
- **CORS Support**: Configured for frontend integration

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **MapStruct** for object mapping
- **Lombok** for reducing boilerplate code
- **Swagger/OpenAPI** for API documentation
- **Maven** for dependency management

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd strayLove
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE straylove;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE straylove TO postgres;
```

### 3. Configuration

Update the database configuration in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/straylove
    username: your_username
    password: your_password
```

### 4. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 5. Access API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and get JWT token
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Animals
- `POST /api/v1/animals` - Report a new animal (Auth required)
- `GET /api/v1/animals` - Search animals (?species=DOG&area=Delhi)
- `GET /api/v1/animals/nearby` - Get nearby animals (?lat=28.6&lon=77.2&radius=5)
- `GET /api/v1/animals/{id}` - Get animal details
- `PUT /api/v1/animals/{id}/approve` - Approve report (Admin only)
- `POST /api/v1/animals/{id}/images` - Add image

### Care Management
- `POST /api/v1/animals/{id}/care/records` - Record care (Volunteer/Admin)
- `POST /api/v1/animals/{id}/care/feeding` - Log feeding (Auth required)
- `GET /api/v1/animals/{id}/care/history` - Get care history
- `GET /api/v1/animals/{id}/care/feeding/schedule` - Get feeding schedule

### Community
- `POST /api/v1/animals/{id}/community/logs` - Add community log
- `POST /api/v1/animals/{id}/community/logs/{logId}/upvote` - Upvote log
- `GET /api/v1/animals/{id}/community/logs` - Get logs (?type=ALERT)

### Donations
- `GET /api/v1/donations/campaigns` - List active campaigns
- `POST /api/v1/donations/campaigns` - Create campaign (Admin)
- `POST /api/v1/donations/donate` - Make donation
- `GET /api/v1/donations/user/{userId}` - User's donations

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `name`
- `email` (Unique)
- `password_hash` (Encrypted)
- `role` (PUBLIC_USER, VOLUNTEER, ADMIN)
- `is_active`
- `created_at`
- `updated_at`

### Animals Table
- `id` (Primary Key)
- `unique_identifier` (Unique)
- `species` (DOG, CAT, OTHER)
- `breed`
- `color`
- `gender` (MALE, FEMALE, UNKNOWN)
- `temperament` (FRIENDLY, SHY, AGGRESSIVE, etc.)
- `health_status` (HEALTHY, INJURED, SICK, etc.)
- `is_vaccinated`
- `is_sterilized`
- `approval_status` (PENDING, APPROVED, REJECTED)
- `reported_by` (Foreign Key to Users)

### Animal Locations Table
- `id` (Primary Key)
- `animal_id` (Foreign Key)
- `latitude`
- `longitude`
- `address`
- `area`
- `city`
- `is_current`
- `created_at`

### Care Records Table
- `id` (Primary Key)
- `animal_id` (Foreign Key)
- `care_type` (VACCINATION, STERILIZATION, FEEDING, etc.)
- `care_date`
- `description`
- `performed_by` (Foreign Key to Users)
- `created_at`

### Feeding Logs Table
- `id` (Primary Key)
- `animal_id` (Foreign Key)
- `fed_by` (Foreign Key to Users)
- `feeding_time`
- `food_type`
- `quantity`
- `created_at`

### Community Logs Table
- `id` (Primary Key)
- `animal_id` (Foreign Key)
- `logged_by` (Foreign Key to Users)
- `log_type` (SIGHTING, CONCERN, UPDATE, ALERT)
- `description`
- `urgency_level` (LOW, MEDIUM, HIGH, CRITICAL)
- `upvote_count`
- `created_at`

### Donation Campaigns Table
- `id` (Primary Key)
- `title`
- `description`
- `target_amount`
- `raised_amount`
- `status` (ACTIVE, COMPLETED, CANCELLED, PAUSED)
- `created_at`
- `updated_at`

### Donations Table
- `id` (Primary Key)
- `campaign_id` (Foreign Key)
- `donor_id` (Foreign Key to Users)
- `amount`
- `payment_status` (PENDING, COMPLETED, FAILED, etc.)
- `transaction_id`
- `message`
- `anonymous`
- `created_at`

## Security

- JWT-based authentication with refresh tokens
- Role-based access control
- Password encryption using BCrypt
- CORS configured for `https://pawhub.in`
- Input validation and sanitization

## Development

### Project Structure

```
src/main/java/com/straylove/
├── config/          # Configuration classes
├── controller/      # REST controllers (v1 API)
├── dto/            # Data Transfer Objects
│   ├── animal/     # Animal-related DTOs
│   ├── auth/       # Authentication DTOs
│   ├── care/       # Care management DTOs
│   ├── community/  # Community engagement DTOs
│   └── donation/   # Donation DTOs
├── entity/         # JPA entities
├── exception/      # Exception handlers
├── mapper/         # MapStruct mappers
├── repository/     # Data repositories
├── security/       # Security configuration
└── service/        # Business logic services
```

### Adding New Features

1. Create entity classes in `entity/` package
2. Create DTOs in appropriate `dto/` subpackage
3. Create repositories in `repository/` package
4. Create services in `service/` package
5. Create controllers in `controller/` package
6. Add MapStruct mappers if needed
7. Update security configuration if required

### Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn jacoco:report
```

## Deployment

### Production Configuration

1. Update `application.yml` with production database settings
2. Set proper JWT secret key
3. Configure CORS for production domain
4. Set up proper logging configuration
5. Configure image storage (Cloudinary recommended)

### Docker Deployment

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/stray-love-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

