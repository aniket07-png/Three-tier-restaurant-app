# AWS Cloud 3-Tier Bistro

A complete, production-ready, fully containerized 3-tier web application built with a React frontend, Node.js/Express API, and MongoDB. This application is optimized to run smoothly within the constraints of the AWS EC2 Free Tier (e.g., `t2.micro` or `t3.micro` instances with 1GB RAM).

---

## 🍽️ What the app does

This application is a simple, real-time management system for a restaurant, composed of three integrated tiers:

1.  **Frontend (Tier 1): React (Vite)**
    *   Optimized, static client application served via a lightweight **Nginx** reverse proxy image.
    *   Displays an interactive **Menu Dashboard** for customers to view items with photos and descriptions (sourced externally from AWS S3 for production optimization).
    *   Includes a functional **Shopping Cart** where items can be added and a new order placed.
    *   Features a simple **Kitchen Dashboard** for staff to view incoming orders and update their fulfillment status.

2.  **Application (Tier 2): Node.js/Express API**
    *   Minimalist REST API designed for high performance and low memory consumption.
    *   Handles all business logic, process order requests, and manages interaction with the database.
    *   Features a conditional **Data Seeding** function that automatically populates MongoDB with initial menu data (including S3 image URLs) if the database is detected as empty on startup.

3.  **Database (Tier 3): MongoDB**
    *   Official MongoDB 7.0 Community Edition image.
    *   Uses a **Docker Volume** (`mongodata`) for persistent data storage across container restarts.

---

## 🔧 Prerequisites

Before running the application, ensure you have the following installed on your host machine (e.g., AWS EC2 instance):

*   [Docker](https://docs.docker.com/get-docker/) (Ensure your user is added to the `docker` group).
*   [Docker Compose](https://docs.docker.com/compose/install/) (Either standalone or as part of the modern `docker compose` plugin).

*(Note: If deploying on a 1GB RAM EC2 free tier instance, creating a 2GB **swap file** is critical to prevent Out of Memory (OOM) errors during `docker build` operations).*

---

## 🚀 How to run it with Docker Compose

Follow these steps to deploy and launch the entire 3-tier stack:

### Step 1: Set the Build-Time Variable (Crucial)

To ensure the production React build (built inside the container) uses the correct relative API path (crucial for Nginx reverse-proxying), you must define the `VITE_API_BASE_URL` variable inside your shell before running Docker Compose.

In your terminal on the host machine, execute:

```bash
export VITE_API_BASE_URL="/api"

docker compose up -d --build


[![Build and Test](https://github.com/aniket07-png/Three-tier-restaurant-app/actions/workflows/reusable-build-test.yml/badge.svg)](https://github.com/aniket07-png/Three-tier-restaurant-app/actions/workflows/reusable-build-test.yml)
