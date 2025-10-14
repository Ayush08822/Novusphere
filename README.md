Novusphere: Online Learning Platform
Novusphere is a modern e-learning platform built with a microservice architecture. It provides a comprehensive ecosystem for instructors to create and manage courses, and for students to enroll, learn, and engage with the content. The platform is designed to be scalable and robust, with a clear separation of concerns between its different services.

✨ Key Features
Student Dashboard ("My Learning"): A dedicated space for students to watch video lectures, download course materials, view announcements, and read/write reviews.

Instructor Dashboard: A full suite of tools for instructors to create courses, upload course images, build out sections, and upload video and file content.

Announcements & Notifications: Instructors can post announcements for their courses, which appear as real-time notifications for enrolled students in the navbar.

Shopping Cart & Checkout: A complete e-commerce flow allowing users to add courses to a cart and proceed to a payment gateway.

Review & Rating System: Students can leave ratings (including half-stars) and written comments, with an aggregated average rating displayed for each course.

Dynamic Search: Users can search for courses by keywords and explore different categories.

🛠️ Technology Stack & Architecture
The platform is built on a distributed microservice architecture, allowing for independent development, deployment, and scaling of its core functionalities.

Frontend:

Framework: React (with TypeScript)

Routing: React Router

Authentication Client: react-oauth2-code-pkce for handling OAuth2 flows with Keycloak.

Styling: Plain CSS / CSS Modules

Backend:

Framework: Java & Spring Boot

Security: Keycloak for Identity and Access Management (IAM) and Spring Security for endpoint protection.

Inter-Service Communication: Spring Cloud OpenFeign (for synchronous calls) and RabbitMQ (for asynchronous messaging).

API Gateway: Manages and routes all incoming frontend requests.

Microservices:

Course Service: Manages course creation, sections, and content metadata.

My Learning Service: Handles user enrollments and tracks course progress.

Cart Service: Manages the user's shopping cart.

Payment Service: Integrates with Stripe for secure payment processing.

Review Service: Manages all course ratings and comments.

Announcement Service: Manages course announcements and user notifications.

Database:

Primary: MySQL

Explored: MongoDB

Testing:

API Testing: Postman

<img width="3999" height="3199" alt="image" src="https://github.com/user-attachments/assets/eb207cc7-ce41-466a-ba78-0eb54647fa7e" />

🚀 Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.

Prerequisites
Java JDK 17 or later

Apache Maven

Node.js and npm

MySQL Server

Docker (for running RabbitMQ and Keycloak instances)

A Stripe account and API keys (secret key and publishable key)

An IDE like IntelliJ IDEA or VS Code

Backend Setup
Each microservice is a separate Spring Boot application and needs to be run independently.

Run Infrastructure: Start your Keycloak and RabbitMQ instances (e.g., using Docker Compose).

Configure Each Service: For each microservice, navigate to its src/main/resources/application.yml file and update the database, Keycloak, RabbitMQ, and Stripe API keys.

Run Each Service: From the root directory of each microservice, run the following command:
mvn spring-boot:run

Ensure all services (API Gateway, Discovery Service, Keycloak, RabbitMQ, and feature services) are running.

Frontend Setup
Navigate to the Frontend Directory:
cd frontend-directory

Install Dependencies:
npm install

Configure Environment Variables: Create a .env.local file in the frontend directory and add your Stripe publishable key:
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_yourPublishableKeyHere

Run the Development Server:
npm start
