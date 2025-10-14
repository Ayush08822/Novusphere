# Novusphere: An Online Learning Platform

Novusphere is not just an e-learning platform; it is a fully-realized, cloud-native educational ecosystem built on a modern microservice architecture. It provides a robust, scalable, and secure environment for instructors to create and distribute high-quality educational content, and for students to engage in an immersive and interactive learning journey. The application is designed from the ground up with a focus on decoupling services, ensuring high availability and independent scalability for each business domain.



<hr/>

## 🌟 Project Vision

The mission of Novusphere is to democratize education by providing a powerful yet intuitive platform for both creators and learners. We aim to:

* **Empower Instructors:** By offering a complete suite of tools that simplifies the process of course creation, content management, and student engagement, allowing educators to focus on what they do best: teaching.
* **Provide an Accessible Learning Experience:** By creating a seamless, user-friendly interface where students can discover new skills, track their progress, and interact with a community of learners.
* **Build a Scalable Foundation:** By leveraging a modern microservice architecture, the platform is built to grow, capable of handling an increasing number of users, courses, and features without compromising performance.

<hr/>

## ✨ Key Features

Novusphere is comprised of several interconnected features that create a cohesive user experience:

* **Student-Centric Learning Environment:**
    * **Immersive Course Player:** An intuitive, tab-based "My Learning" dashboard for a focused learning experience.
    * **Rich Media Consumption:** Seamless video playback and easy access to downloadable course materials like PDFs and source code.
    * **Real-Time Updates:** An integrated notification system that displays course announcements directly in the navbar.

* **Comprehensive Instructor Toolkit:**
    * **Course Management Dashboard:** A dedicated space for instructors to create, update, and manage their portfolio of courses.
    * **Rich Content Uploads:** Tools to upload high-quality course images, structure content into sections, and upload both video lectures and supplementary files.
    * **Student Engagement:** An announcement system to broadcast updates, news, or messages to all enrolled students for a specific course.

* **Secure E-commerce and Feedback Loop:**
    * **Integrated Shopping Cart:** A full-featured shopping cart where users can add multiple courses before proceeding to checkout.
    * **Secure Payment Processing:** A robust checkout flow integrated with **Stripe** for secure, reliable, and PCI-compliant payment processing.
    * **Interactive Review System:** A feedback mechanism allowing students to leave detailed reviews with ratings (including half-stars) and written comments, which are aggregated to display an overall course rating.

<hr/>

## 🛠️ How It's Built: Architecture & Technology Stack

The platform's foundation is a distributed **microservice architecture**, where each core business capability is an independent, deployable service. This design choice was made to enhance scalability, improve fault isolation, and allow for parallel development and technology evolution.



[Image of a microservice architecture diagram]


### Guiding Principles

* **Scalability & Performance:** Each service can be scaled independently based on its specific load.
* **Resilience:** Failure in one non-critical service (e.g., Reviews) will not bring down the entire platform.
* **Maintainability:** Smaller, domain-focused codebases are easier to understand, maintain, and update.
* **Security:** Centralized authentication and authorization with decentralized enforcement at the service level.

### Backend Technology

The backend is a collection of specialized Spring Boot services that communicate through both synchronous and asynchronous patterns, orchestrated via an API Gateway.

* **Framework:** **Java 17** & **Spring Boot 3** form the backbone of all microservices, chosen for its mature ecosystem, performance, and robust tools for building enterprise-grade applications.
* **Security & Identity:** **Keycloak** serves as the centralized Identity and Access Management (IAM) provider, handling user registration, login, and OAuth2/OIDC token generation. **Spring Security** is used within each microservice to secure REST endpoints by validating the JWTs issued by Keycloak.
* **Synchronous Communication:** **Spring Cloud OpenFeign** is used to create clean, declarative REST clients for direct, request-response communication between services (e.g., the Payment Service fetching course details from the Course Service).
* **Asynchronous Communication:** **RabbitMQ** is implemented as a message broker for event-driven, asynchronous communication. This decouples services and handles background tasks efficiently, such as notifying users after an instructor posts a new announcement.
* **API Gateway:** A **Spring Cloud Gateway** instance acts as the single entry point for all frontend requests. It handles routing to the appropriate microservice and centralizes cross-cutting concerns like security and rate limiting.

### Frontend Technology

The user interface is a modern single-page application (SPA) built for a fast, dynamic, and responsive user experience.

* **Framework:** **React** (with **TypeScript**) was chosen for its component-based architecture, which promotes reusability and maintainability. TypeScript adds crucial type safety, reducing bugs and improving the developer experience in a large-scale application.
* **Routing:** **React Router** manages all client-side routing and navigation, enabling a seamless multi-page experience without full browser reloads.
* **Authentication Handling:** The **`react-oauth2-code-pkce`** library is used on the client-side to securely manage the Authorization Code Flow with PKCE, which is the recommended OAuth2 flow for SPAs interacting with a server like Keycloak.

### Data & Infrastructure

* **Database:** **MySQL** is used as the primary relational database. Its transactional nature and structured schema are ideal for storing critical data like user enrollments, course information, and financial records.
* **Payment Processing:** **Stripe** is fully integrated for all payment-related tasks. By delegating payment processing to Stripe, the application benefits from its robust security, global compliance (PCI DSS), and pre-built checkout experience.

<hr/>

## 🚀 Future Roadmap

* **AI-Powered Features:** Integration of AI models for automatic video transcription and summarization to enhance the learning experience.
* **Community & Q&A:** A dedicated Q&A section for each course to foster a community and allow students to ask questions.
* **Gamification:** Introduction of badges, points, and certificates to motivate students and track their achievements.
* **Advanced Analytics:** A dashboard for instructors to view student engagement, course completion rates, and other key metrics.

<hr/>
