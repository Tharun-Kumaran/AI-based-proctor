# AI Online Examination & Intelligent Proctoring System (AEPS)

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue.svg?logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-navy.svg?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

---

## 📌 Executive Summary

The **AI Online Examination & Intelligent Proctoring System (AEPS)** is an enterprise-grade, distributed educational assessment and continuous proctoring platform. Built for university faculties, technical institutions, and examination boards, AEPS provides an uncompromised testing environment for both **Multiple-Choice Questions (MCQ)** and **Interactive Algorithmic Coding Assessments**.

The platform couples high-throughput backend services with an asynchronous computer-vision microservice and an intuitive candidate web interface. It actively monitors for physical and digital anomalies (facial rotation, gaze drift, multiple persons, unauthorized mobile devices, vocal frequencies, tab switching, and window blurring) using an exponential time-decayed behavioral risk model.

---

## 🏛️ System Architecture

AEPS is engineered around a decoupled, highly resilient multi-tier microservice architecture optimized for low-latency telemetry ingestion, robust candidate isolation, and fault tolerance during high-stakes institutional examinations.

### Architectural Breakdown

| Tier | Component | Core Responsibilities & Technologies |
| :--- | :--- | :--- |
| **Presentation Tier** | Candidate & Admin Web Portals | • Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.<br/>• Real-time in-browser frame capture and Web Audio API vocal frequency analysis.<br/>• Sandboxed multi-language IDE with real-time feedback and execution HUD.<br/>• Dynamic Proctor HUD displaying live compliance alerts and risk status. |
| **Application & Orchestration Tier** | Core Backend Gateway | • Built on **Spring Boot 3.3.4** and **Java 21**.<br/>• Centralized authentication, RBAC, and secure JWT token lifecycle management.<br/>• Multi-language sandboxed code execution pipeline (`.exec_sandbox`).<br/>• Exponential time-decay behavioral risk accumulation engine.<br/>• Institutional reporting, Flyway schema management, and automated export services. |
| **Computer Vision & AI Tier** | AI Inference Microservice | • Powered by **FastAPI (Python 3.11+)**, **OpenCV**, **MediaPipe**, and **scikit-learn**.<br/>• 478 3D facial landmark detection and `SolvePnP` head pose estimation (Pitch, Yaw, Roll).<br/>• Iris coordinate tracking, gaze vector drift analysis, and secondary device detection.<br/>• Random Forest algorithmic problem classifier and Google Gemini assessment synthesis. |
| **Persistence & Governance Tier** | Data & Audit Storage | • **PostgreSQL 16** with strict relational integrity and ACID guarantees.<br/>• Automated schema versioning and database evolution via **Flyway** (`V1` to `V23`).<br/>• Append-only immutable audit trail recording administrative actions and proctoring events. |

### End-to-End System Workflow

1. **Authentication & Session Authorization:** Candidates authenticate through the Presentation Tier. The backend gateway verifies credentials using BCrypt and returns signed JWT access tokens with granular role-based permissions.
2. **Live Telemetry Acquisition:** During an active exam, the client captures compressed video frames and audio FFT telemetry at scheduled intervals, dispatching them securely over HTTPS/TLS to the backend gateway.
3. **Computer Vision Inference Pipeline:** The backend gateway routes incoming frames to the internal FastAPI microservice (`/v1/analyze/frame`), executing parallel facial landmark detection, gaze vector estimation, and anomaly detection.
4. **Time-Decayed Behavioral Scoring:** Telemetry anomalies are scored using an exponential time-decay function. Sustained or severe infractions immediately increment candidate risk levels and dispatch real-time warning HUD events or proctor alerts.
5. **Transactional Persistence & Audit Trail:** All infraction logs, session heartbeats, and exam events are transactionally committed to PostgreSQL, providing real-time oversight for faculty dashboards and tamper-evident forensic reporting.

---

## ✨ Core Platform Capabilities

### 1. Multi-Modal AI Proctoring Engine
* **3D Face Mesh & Iris Tracking:** Utilizes MediaPipe Face Landmarker with 478 3D facial coordinates to compute real-time gaze vectors and detect looking left, right, up, or down.
* **Head Pose Estimation:** Employs OpenCV `SolvePnP` with a 3D generic facial anthropometric model to calculate Pitch, Yaw, and Roll angles.
* **Multiple Face & Anomaly Detection:** Flags multiple attendees, absent candidates, and obscured faces. Includes native fallback to Haar Cascade classifiers if MediaPipe assets are degraded.
* **Prohibited Device Detection:** Detects mobile phones, earplugs, books, and secondary devices using low-latency edge vision.
* **Audio Voice Activity Detection (VAD):** In-browser Web Audio API real-time Fast Fourier Transform (FFT) analysis to measure decibel variance and isolate human vocal frequencies.
* **Browser Lockdown & Integrity:** Detects tab switches, fullscreen exit, window blur, dual-monitor screen-sharing anomalies, and clipboard tampering (cut, copy, paste).
* **Exponential Time-Decayed Risk Engine:** Weights incoming infractions against an exponential half-life decay, preventing historical isolated anomalies from unfairly terminating exams while instantly penalizing continuous infractions.

### 2. Comprehensive Assessment & Online IDE
* **Hybrid Exam Paradigms:** Supports standard Multiple-Choice Questions (MCQ) with randomized question banks, as well as live technical coding challenges.
* **Multi-Language Sandboxed IDE:** Low-latency code execution engine supporting **Python 3**, **Java 21**, **C (GCC)**, and **C++ (G++)** inside isolated process boundaries with configurable memory limits and execution timeouts.
* **Gemini AI Question Generation:** Integrates Google Gemini API to extract algorithmic concepts from instructor hints and automatically synthesize diverse problem descriptions, starter code, and verified hidden/public test cases.
* **Resilient Random Forest Classifier:** Classifies generated problems across 6 major technical disciplines. Features an automatic pure-Python TF-IDF centroid fallback ensuring continuous operation even under strict OS application control policies (e.g., Windows Smart App Control / WDAC).

### 3. Identity, Governance & Institutional Management
* **Unified RBAC:** Single centralized authentication gateway serving **Super Administrators**, **Professors**, **Department Coordinators**, and **Students**.
* **First-Login Mandatory Password Reset:** Newly onboarded users with temporary credentials are automatically routed to a mandatory password change screen before gaining examination access.
* **Academic Year Normalization:** Automated institutional data pipelines that unify diverse student year formats (`"2nd year"`, `"2nd Year"`, `"II"`, `"2"`) into clean canonical standards.
* **Class Section Partitioning:** High-speed automatic grouping of registered students into classes and sections based on registration number ranges and department codes.
* **One-Click Institutional PDF Generator:** Generates branded, tabular credential sheets for faculty distribution (utilizing OpenPDF) with individual student cut-outs, encrypted credentials, and section statistics.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks | Purpose |
| :--- | :--- | :--- |
| **Frontend Client** | React 19, TypeScript 5.6, Vite, Tailwind CSS v4, Lucide Icons, Recharts | Single-Page Application (SPA), candidate portal, real-time proctoring, admin analytics. |
| **Core Backend** | Java 21, Spring Boot 3.3.4, Spring Security, Spring Data JPA, OpenPDF, Apache POI | Business logic, authentication, RBAC, database migrations, PDF/Excel generation, rate limiting. |
| **AI Computer Vision** | Python 3.11+, FastAPI, OpenCV (SolvePnP), MediaPipe, ONNX Runtime, NumPy, scikit-learn | Low-latency facial tracking, iris telemetry, head-pose estimation, problem classification. |
| **Database & Schema** | PostgreSQL 16 Alpine, Flyway Migration Framework (V1 - V23) | Relational persistence, audit logging, schema versioning, strict transactional consistency. |
| **Security & Auditing** | BCrypt (Cost 4-10), JWT Bearer (HMAC-SHA256), Bucket4j, In-Memory Refresh Tokens | Identity management, rate-limiting against DDoS/brute-force, regulatory audit logs. |
| **DevOps & Tunnels** | Docker, Docker Compose, Nginx, Cloudflare Tunnel (`cloudflared`), Ngrok | Multi-stage containerization, SSL/TLS termination, reverse proxy, remote exam access. |

---

## 📂 Repository Directory Layout

```
Proctor-Git/
├── backend/                             # Spring Boot 3 Core Backend (Java 21)
│   ├── src/main/java/com/proctor/exam/ # Core controllers, services, security filters, DTOs
│   ├── src/main/resources/
│   │   ├── application.yml              # Central backend runtime configuration
│   │   └── db/migration/                # Flyway relational schema evolution (V1__... to V23__...)
│   ├── pom.xml                          # Maven project descriptor
│   └── mvnw.cmd / mvnw                  # Self-contained Maven Wrapper executables
│
├── frontend/                            # React 19 Client Web Application
│   ├── src/
│   │   ├── pages/                       # Student Exam, Admin Dashboard, Instructions, IDE
│   │   ├── components/                  # Video Proctoring Cam, HUD warnings, charts, modals
│   │   ├── hooks/                       # useFaceDetector, useSpeechDetector, useProctoring
│   │   └── utils/                       # sectionUtils.ts, api client, formatting helpers
│   ├── package.json                     # NPM dependency manifest
│   └── vite.config.ts                   # Vite bundler configuration & dev server proxy
│
├── ai-service/                          # Computer Vision & Machine Learning Microservice
│   ├── app/
│   │   ├── main.py                      # FastAPI application entrypoint & healthcheck
│   │   ├── config.py                    # Threshold constants (Pitch, Yaw, Gaze, Face counts)
│   │   ├── assessment_routes.py         # Code execution & algorithmic generation routes
│   │   ├── models/face_detector.py      # OpenCV SolvePnP & MediaPipe landmark analysis
│   │   └── services/                    # Random Forest, Gemini integration, isolated runner
│   ├── requirements.txt                 # Python production dependencies
│   └── Dockerfile                       # Multi-stage lightweight Python container
│
├── docker-compose.yml                   # Production multi-container composition
├── start-all.bat                        # Windows 1-click launch script (launches all 3 tiers)
├── run-backend.bat                      # Windows launcher for Spring Boot
├── run-frontend.bat                     # Windows launcher for Vite frontend
├── run-ai.bat                           # Windows launcher for FastAPI AI service
├── run-tunnel.bat                       # Exposes local stack to Cloudflare Tunnel / Ngrok
└── simulate_students.py                 # Multi-candidate load simulator for stress-testing
```

---

## 🚀 Deployment & Operations Guide

### Option 1: Full-Stack Docker Deployment (Production Recommended)

The repository provides production-tuned multi-stage Dockerfiles. Neither Java, Maven, nor Python needs to be installed on the host system.

#### Prerequisites
* Docker Engine 24+ & Docker Compose v2+
* Linux (Debian 12, Ubuntu 22.04/24.04, Proxmox LXC/VM) or Windows with WSL2

#### 1. Configure Environment Secrets
Create a `.env` file in the project root:
```ini
POSTGRES_DB=examdb
POSTGRES_USER=examuser
POSTGRES_PASSWORD=YourSuperSecurePassword123!
JWT_SECRET=YourAtLeast32ByteRandomSecretStringForTokenSigning!
CORS_ALLOWED_ORIGINS=https://proctor.yourdomain.com,http://localhost:5173
REQUIRE_HTTPS=true
```

#### 2. Launch Container Fleet
```bash
# Clone the repository
git clone https://github.com/your-org/Proctor-Git.git
cd Proctor-Git

# Build and start all 4 services in detached mode
docker compose up -d --build

# Verify healthy status across containers
docker compose ps
```

#### 3. Exposed Container Ports
| Service | Host Port | Internal Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `80`, `443` | `80`, `443` | HTTP / HTTPS | Nginx web server & SSL termination |
| **Backend** | `8080` | `8080` | HTTP | Spring Boot REST API |
| **AI Service**| `8000` | `8000` | HTTP | FastAPI Computer Vision & Swagger docs |
| **Database**  | `5433` | `5432` | TCP | PostgreSQL persistence |

---

### Option 2: Local Native Development (Without Docker)

#### Prerequisites
1. **JDK 21** (Eclipse Temurin, Amazon Corretto, or Oracle OpenJDK)
2. **Node.js 20+** & **npm 10+**
3. **Python 3.10+** (Python 3.11 or 3.12 recommended)
4. **PostgreSQL 16** running locally on port `5432` (or `5433`)

#### 1. Setup PostgreSQL Database
```sql
CREATE USER examuser WITH PASSWORD 'exampass';
CREATE DATABASE examdb OWNER examuser;
GRANT ALL PRIVILEGES ON DATABASE examdb TO examuser;
```

#### 2. Launch Core Backend (Spring Boot)
```bash
cd backend

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux/macOS:
./mvnw spring-boot:run
```
*Flyway migrations (`V1` through `V23`) will automatically apply schema definitions on startup.*

#### 3. Launch AI Computer Vision Microservice (FastAPI)
```bash
cd ai-service

# Create and activate Python virtual environment
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start Uvicorn ASGI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Launch Candidate & Admin Portal (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

#### 5. Windows 1-Click Fast Launch
Double-click `start-all.bat` from the root directory to spawn all three services simultaneously in dedicated command windows.

---

## 🔒 Security Architecture & Governance

* **Authentication & In-Memory Token Rotation:**
  * JWT access tokens are signed using HMAC-SHA256 with a 30-minute lifespan.
  * 7-day refresh tokens are securely persisted with SHA-256 hashing.
  * The frontend maintains access tokens exclusively in private application memory to thwart Cross-Site Scripting (XSS) credential theft.
* **Bucket4j Per-IP Rate Limiting:**
  * `POST /api/verify-student`: Max 10 requests / minute.
  * `POST /api/proctor/frame`: Max 60 requests / minute.
  * `GET /api/admin/reports/export`: Max 5 requests / minute.
* **First-Login Credential Hygiene (`must_reset_password`):**
  * Prevents administrative password interception. All bulk-uploaded or system-generated student and faculty credentials enforce mandatory immediate password replacement upon initial authentication.
* **Audit Trail Compliance:**
  * Every consequential administrative and system action (logins, logouts, lockouts, exam publishing, question modification, manual score overrides, and telemetry risk escalations) is permanently written to the `audit_logs` table.
* **Automated Secret Scanning:**
  * Root-level `.gitleaks.toml` configuration strictly prevents accidental commits of secrets, API keys, or private certificates.

---

## 📊 Database Schema Migration Lifecycle (Flyway)

Relational evolution is managed strictly via versioned Flyway SQL migrations located in `backend/src/main/resources/db/migration/`:

| Version | Migration Identifier | Scope & Architectural Description |
| :--- | :--- | :--- |
| **V1 - V7** | `init_schema` to `pgcrypto` | Core users, roles, exams, proctoring sessions, telemetry events, and cryptographic extensions. |
| **V8 - V12** | `coding_questions` to `student_register_number` | Algorithmic test cases, coding question entities, admin accounts, and register number indexing. |
| **V13 - V16** | `department_coordinator` to `professor_login` | Academic departments, coordinator flags, student credential stores, and professor access portals. |
| **V17** | `first_login_password_reset` | Mandatory `must_reset_password` state flags across all user tiers. |
| **V18 - V21** | `assign_professor` to `assigning_professor` | Granular faculty-to-class assignment and ownership controls. |
| **V22** | `class_sections` | Section grouping registry and automated student cohort mapping. |
| **V23** | `normalize_student_years` | In-place data hygiene migration standardizing academic years into canonical Title Case. |

---

## 🧪 Quality Assurance & Load Simulation

### Automated Load Testing Script
Simulate dozens of concurrent students taking an exam with simulated camera telemetry, heartbeats, and randomized proctoring warnings:

```bash
python simulate_students.py --students 50 --exam-id 1 --duration-mins 15
```

### Static Analysis & Verification
```bash
# Verify backend compilation and Spring context integrity
cd backend
.\mvnw.cmd test-compile -DskipTests

# Verify TypeScript types and frontend build integrity
cd ../frontend
npm run build
```

---

## 📑 License & Disclaimer

Copyright © 2024–2026. All rights reserved.  
Developed for secure academic examination delivery and institutional proctoring administration. Unauthorized copying, distribution, or commercial exploitation is strictly prohibited.
