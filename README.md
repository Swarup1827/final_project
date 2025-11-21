# Inventory Management System

A full-stack inventory management application for shopkeepers to manage their inventory and for shoppers to view products from nearby shops.

## Project Structure

```
Final Project/
├── backend/          # Spring Boot + Gradle + PostgreSQL
└── frontend/         # Next.js + TypeScript + Axios
```

## Backend (Spring Boot)

### Prerequisites
- Java 17+
- PostgreSQL
- Gradle

### Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE inventory_db;
```

2. Update `application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/inventory_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Update JWT secret in `application.properties`:
```properties
jwt.secret=your-secret-key-change-this-in-production-minimum-256-bits
```

4. Run the application:
```bash
cd backend
./gradlew bootRun
```

The backend will run on `http://localhost:8080`

### API Endpoints

#### Shop Endpoints
- `POST /api/v1/shops` - Register a new shop (requires SHOP role)
- `GET /api/v1/shops/mine` - Get current user's shops (requires SHOP role)
- `GET /api/v1/shops/{id}` - Get shop by ID (requires SHOP role)
- `DELETE /api/v1/shops/{id}` - Delete a single shop (requires SHOP role)
- `DELETE /api/v1/shops/bulk` - Delete multiple shops in one request (requires SHOP role)

#### Product Endpoints
- `POST /api/v1/shops/{shopId}/products` - Add product to shop (requires SHOP role)
- `GET /api/v1/shops/{shopId}/products` - Get products by shop (requires SHOP role)
- `PUT /api/v1/products/{id}` - Update product (requires SHOP role)
- `DELETE /api/v1/products/{id}` - Delete product (requires SHOP role)

### Authentication

All endpoints require JWT authentication with `ROLE_SHOP`. The JWT should be included in the Authorization header:
```
Authorization: Bearer <token>
```

**Note:** The JWT should contain:
- `userId`: Long (user ID)
- `role`: String (e.g., "SHOP")

## Frontend (Next.js)

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Update API URL in `.env.local` if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Pages

- `/` - Home (redirects to login or dashboard)
- `/login` - Login page (mock implementation - needs integration with auth API)
- `/register-shop` - Shop registration page
- `/dashboard` - Shop owner dashboard with product management
- `/delete-shops` - Bulk shop removal page with two-step confirmation

### Features

- Shop registration
- Automatic geolocation capture during shop registration
- Configurable open hours and delivery options per shop
- Bulk shop deletion with two-step confirmation
- Product CRUD operations
- JWT authentication
- Route protection
- Responsive UI

## Important Notes

1. **Authentication**: The login page currently uses a mock implementation. You need to integrate it with your actual authentication API that returns JWT tokens.

2. **JWT Structure**: The backend expects JWT tokens with `userId` and `role` claims. Make sure your authentication service generates tokens in this format.

3. **Database**: The application uses JPA with `ddl-auto=update`, so tables will be created automatically on first run.

4. **CORS**: CORS is configured to allow requests from `http://localhost:3000`. Update if needed.
5. **Geolocation**: The shop registration page prompts for browser geolocation access to capture latitude/longitude. Ensure location permissions are granted during testing.

## Testing the Flow

1. Start PostgreSQL and create the database
2. Start the backend: `cd backend && ./gradlew bootRun`
3. Start the frontend: `cd frontend && npm run dev`
4. Login (using mock login - any username/password works)
5. Register a shop
6. Add products to your shop
7. View and manage products in the dashboard

## Development

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security
- PostgreSQL
- JWT (jjwt)

### Frontend
- Next.js 14
- TypeScript
- Axios
- React Hooks

## License

This is a project for educational purposes.

