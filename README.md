# School Inventory System

A school inventory management platform for tracking classroom equipment, processing borrowing requests, and generating administrative reports.

## Project Overview
School staff and students depend on shared resources such as projectors, monitors, USB drives, and stationery. This system digitizes the full flow of inventory operations so both users and administrators can work faster and with better visibility.

### Core Goals
- Keep an up-to-date catalog of equipment and supplies.
- Let users request items and track request status.
- Let administrators approve/reject requests, monitor item condition, and export reports.

## User Roles

### User
**What users can do**
- View available equipment.
- Submit item requests.
- View personal request and borrowing history.

**What users cannot do**
- Create, update, or delete inventory items.
- Approve or reject requests.
- Access administrative settings and reports.

### Administrator
**What admins can do**
- Manage users and permissions.
- Create, update, delete equipment records.
- Approve or reject equipment requests.
- Log returns and update condition notes.
- Export reports (CSV/PDF).

**Restriction**
- Administrative responsibility is separated from physical handling duties unless an admin is also explicitly assigned operational tasks.

## Feature Set

### Mandatory Features
1. **Authentication & Role-Based Access**
   - User/Admin role separation.
2. **Inventory Catalog**
   - Search and filtering.
   - Item fields: name, type, serial number, condition, status, location, photo.
3. **Equipment Request Workflow**
   - Request items by date/time.
   - Approval flow for sensitive/limited stock items.
4. **Condition & Status Tracking**
   - Status states: `Available`, `Checked Out`, `Under Repair`, `Retired`.
   - Return-time condition logging.
5. **Return & History Logs**
   - Request lifecycle and return tracking.
   - History by user and by item.

### Optional/Extended Features
- QR or barcode tagging.
- Email reminders.
- Low stock alerts.
- Usage analytics dashboards.
- CSV/Excel exports and/or document previews.

## Architecture

## Backend (Implemented)
This repository uses a microservice-style backend:

- **auth-service**: registration, login, user management, JWT issuance.
- **inventory-service**: equipment CRUD and status updates.
- **request-service**: request/approval/return workflow.
- **report-service**: usage/history reports and export.
- **notifications-service**: messaging + notification persistence.
- **api-gateway**: centralized routing for frontend/API clients.

## Frontend (Implemented as static client)
A static HTML/CSS/JS frontend is available in `frontend/` with separate views for user/admin flows and role-based navigation.

## Tech Stack

### Backend
- Java 17+
- Spring Boot
- Spring Security (JWT-protected endpoints)
- Spring Cloud Gateway
- Spring Data JPA
- MySQL
- RabbitMQ

### Frontend
- HTML, CSS, JavaScript (vanilla)

### Supporting Tools
- Nodemailer / email service
- CSV/PDF export in report service

## API Endpoints

> All routes are exposed through the API gateway (`http://localhost:9000`) and forwarded to internal services.

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/users/{username}`
- `GET /api/auth/get-all`
- `PUT /api/auth/update/{username}`
- `DELETE /api/auth/delete/{username}`

### Equipment Management
- `GET /api/equipment`
- `GET /api/equipment/{id}`
- `POST /api/equipment`
- `PUT /api/equipment/{id}`
- `PUT /api/equipment/{id}/status?newStatus=...`
- `DELETE /api/equipment/{id}`

### Requests
- `POST /api/request`
- `GET /api/requests`
- `GET /api/manager/requests`
- `PUT /api/request/{id}/approve`
- `PUT /api/request/{id}/reject`
- `PUT /api/request/{id}/checkout`
- `PUT /api/request/{id}/return`
- `PUT /api/request/{id}/cancel`

### Reports
- `GET /api/reports/usage`
- `GET /api/reports/history`
- `GET /api/reports/export?type=usage|history&format=csv|pdf`

## Local Development Setup

## Prerequisites
- Java 17+
- Maven 3.9+
- MySQL running locally (default DB: `school_inventory`)
- RabbitMQ running locally (default guest credentials)
- Node.js (only for `backend/email-service`)

## Default Service Ports
- API Gateway: `9000`
- Auth Service: `8080`
- Inventory Service: `8081`
- Notifications Service: `8082`
- Report Service: `8083`
- Request Service: `8084`

## Run Order (Recommended)
1. Start MySQL
2. Start RabbitMQ
3. Start backend services (`auth`, `inventory`, `request`, `report`, `notifications`)
4. Start API gateway
5. Open frontend pages from `frontend/html/` (for example via Live Server)

## Example (per Java service)
```bash
cd backend/auth-service
./mvnw spring-boot:run
```

Repeat for each backend service directory.

## Frontend Entry Point
Open:
- `frontend/html/login.html`

The frontend is already configured to call the API gateway at `http://localhost:9000`.
