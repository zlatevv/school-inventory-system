# 🎓 School Inventory System

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A comprehensive, microservice-based school inventory management platform designed to track classroom equipment, process borrowing requests, and generate administrative reports.

## 📖 Project Overview
School staff and students depend on shared resources such as projectors, monitors, USB drives, and stationery. This system digitizes the full flow of inventory operations, enabling faster workflows, clear visibility, and strict accountability.

### Core Objectives
* **Centralized Catalog:** Maintain an up-to-date registry of all school equipment and supplies.
* **Frictionless Borrowing:** Allow users to request items and track their request status in real-time.
* **Administrative Control:** Empower admins to approve/reject requests, monitor item conditions, and export detailed usage reports.

---

## 👥 User Roles & Permissions

| Feature | 👤 User | 🛡️ Administrator |
| :--- | :---: | :---: |
| **View Equipment** | ✅ | ✅ |
| **Submit Requests** | ✅ | ✅ |
| **View Own History** | ✅ | ✅ |
| **Manage Users & Roles** | ❌ | ✅ |
| **Add/Edit/Delete Items**| ❌ | ✅ |
| **Approve/Reject Requests**| ❌ | ✅ |
| **Log Returns & Conditions**| ❌ | ✅ |
| **Export Reports (CSV/PDF)**| ❌ | ✅ |

> **Note:** Administrative responsibility is separated from physical handling duties unless an admin is explicitly assigned operational tasks.

---

## 🏗️ Architecture & Tech Stack

This project utilizes a **Microservices Architecture**, securely routed through an API Gateway.

### Backend Services
* 🔐 **auth-service:** Registration, login, user management, and JWT issuance.
* 📦 **inventory-service:** Equipment CRUD operations and status updates.
* 🔄 **request-service:** Workflow engine for requests, approvals, and returns.
* 📊 **report-service:** Usage/history reporting and document export.
* 🔔 **notifications-service:** Asynchronous messaging and email alerts via RabbitMQ.
* 🚪 **api-gateway:** Centralized routing (`http://localhost:9000`) for all frontend clients.

### Infrastructure & Frontend
* **Database:** MySQL
* **Message Broker:** RabbitMQ
* **Frontend:** Static HTML, CSS, Vanilla JavaScript (Role-based navigation)
* **External Tools:** Nodemailer (Email Delivery), CSV/PDF generation tools.

---

## 🚀 Getting Started

### Prerequisites
* Java 17+ & Maven 3.9+
* Node.js (for `email-service`)
* Docker & Docker Compose (Recommended)

### Option A: Running with Docker (Recommended)
The fastest way to get the entire microservice ecosystem running.

```bash
# Clone the repository
git clone https://github.com/zlatevv/school-inventory.git
cd school-inventory

# Start all services, databases, and message brokers
docker-compose up --build -d
```

### Option B: Manual Local Setup
If you prefer running services individually via your IDE or terminal:
1. Start local **MySQL** (Database: `school_inventory`) and **RabbitMQ**.
2. Start the microservices in the following order:
   ```bash
   cd backend/auth-service
   ./mvnw spring-boot:run
   ```
   *(Repeat for `inventory`, `request`, `report`, and `notifications` services).*
3. Start the **API Gateway** (`cd backend/api-gateway && ./mvnw spring-boot:run`).
4. Open `frontend/html/login.html` using a Live Server.

---

## 🔌 Default Service Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `9000` | Main entry point for all API calls |
| **Auth Service** | `8080` | Handles `/api/auth/**` |
| **Inventory Service** | `8081` | Handles `/api/equipment/**` |
| **Notifications** | `8082` | Internal event processing |
| **Report Service** | `8083` | Handles `/api/reports/**` |
| **Request Service** | `8084` | Handles `/api/request/**` |

---

## 📡 API Reference

All routes are exposed through the API gateway (`http://localhost:9000`) and require a valid JWT token (except Login/Register).

<details>
<summary><b>🔐 Authentication Endpoints</b></summary>

* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate and receive JWT
* `POST /api/auth/logout` - Invalidate session
* `GET /api/auth/users/{username}` - Get specific user details
* `GET /api/auth/get-all` - List all users (Admin)
* `PUT /api/auth/update/{username}` - Update user details
* `DELETE /api/auth/delete/{username}` - Remove user (Admin)

</details>

<details>
<summary><b>📦 Equipment Management</b></summary>

* `GET /api/equipment` - List all equipment
* `GET /api/equipment/{id}` - Get equipment details
* `POST /api/equipment` - Add new equipment (Admin)
* `PUT /api/equipment/{id}` - Update equipment details (Admin)
* `PUT /api/equipment/{id}/status?newStatus=...` - Change item status
* `DELETE /api/equipment/{id}` - Remove equipment (Admin)

</details>

<details>
<summary><b>🔄 Request Workflow</b></summary>

* `POST /api/request` - Create a new borrow request
* `GET /api/requests` - View current user's requests
* `GET /api/manager/requests` - View all pending requests (Admin)
* `PUT /api/request/{id}/approve` - Approve request (Admin)
* `PUT /api/request/{id}/reject` - Reject request (Admin)
* `PUT /api/request/{id}/checkout` - Mark item as physically taken
* `PUT /api/request/{id}/return` - Return item & log condition
* `PUT /api/request/{id}/cancel` - Cancel a pending request

</details>

<details>
<summary><b>📊 Reports</b></summary>

* `GET /api/reports/usage` - Get system usage statistics
* `GET /api/reports/history` - Get complete borrowing history
* `GET /api/reports/export?type={type}&format={format}` - Export data as CSV/PDF (Admin)

</details>
