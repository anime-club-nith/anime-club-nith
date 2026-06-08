# Anime Club NITH Backend

The backend for the Anime Club NITH project is built with Node.js, Express, and TypeScript. It provides a RESTful API for core functionalities and utilizes Socket.io for real-time communication features.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express (v5.x)
-   **Language**: TypeScript
-   **Database**: MongoDB with Mongoose ODM
-   **Real-time**: Socket.io
-   **Storage**: Cloudinary (via `cloudinary`)
-   **Authentication**: JWT (JSON Web Tokens) & Cookie-parser
-   **Notifications**: Expo Server SDK
-   **Mailing**: Nodemailer

## Project Structure

```text
backend/
├── controllers/    # Request handlers & business logic
├── middlewares/    # Custom Express middlewares (e.g., Auth)
├── models/         # Mongoose schemas and TypeScript interfaces
├── routes/         # API route definitions
├── services/       # External service integrations (Cloudinary, Socket, MongoDB, Email)
├── types/          # Global TypeScript type definitions
├── server.ts       # Application entry point & configuration
└── tsconfig.json   # TypeScript configuration
```

## Architecture

### 1. REST API
The primary interface for client applications, organized into modular routes.
-   **Auth**: Handles registration, login, password recovery, and email verification.
-   **Blog**: Manages blog post creation, editing, and retrieval.
-   **Room**: Manages chat rooms and member associations.
-   **Project**: Handles project showcase listings.
-   **Features**: Manages feature requests and status updates.

### 2. Real-time (WebSockets)
Powered by **Socket.io**, the backend supports real-time chat functionality. The configuration and setup are managed in `services/socket.ts` and initialized in `server.ts`.

### 3. Service Layer
Encapsulates logic for external integrations:
-   `connection.ts`: MongoDB connection management.
-   `cloudinary.ts`: Utilities for interacting with Cloudinary.
-   `sendEmail.ts` & `verifyAcc.ts`: Email handling for account verification and password resets.
-   `socket.ts`: Socket.io event handling and setup.

### 4. Middleware
-   `allowOnlyAuthenticatedUser`: Protects routes by verifying JWT tokens stored in cookies.

## API Reference

### Authentication (/api/auth)
-   `POST /signup` - Register a new user.
-   `POST /login` - Authenticate user and set session cookie.
-   `POST /logout` - Clear session cookie.
-   `GET /verify-acc` - Verify user email.
-   `POST /forget-password/viaEmail` - Request password reset via email.
-   `POST /save-token` - Save Expo push token for notifications.

### Blogs (/api/blog)
-   `GET /` - Get all public blogs.
-   `GET /:blogId` - Get a specific blog.
-   `POST /` - Create a new blog (Auth required).
-   `PUT /edit/:blogId` - Edit a blog.
-   `DELETE /delete/:blogId` - Delete a blog.
-   `GET /my-blogs/:userId` - Get blogs by a specific user.

### Chat & Rooms (/api/chat, /api/room)
-   `GET /api/room/allRooms` - List all available chat rooms.
-   `POST /api/room/` - Create a new room.
-   `GET /api/room/:roomId` - Get room information.
-   `POST /api/chat/:roomId` - Send a message (supports image upload via Multer).
-   `GET /api/chat/chat-history/:roomId` - Retrieve message history for a room.

### Projects & Features
-   `GET /api/project/` - Get all projects.
-   `POST /api/project/post` - Post a new project.
-   `GET /api/features/` - Get all feature requests.
-   `POST /api/features/` - Submit a new feature request.

## Setup and Development

### Prerequisites
-   Node.js installed.
-   MongoDB instance (Local or Atlas).

### Installation
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration
Create a `.env` file in the `backend` directory and provide the following variables:

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port number for the server (e.g., 8001) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `JWT_ENCRYP_KEY` | Secret key for JWT signing |
| `MAIL_USER` | Email address for sending notifications (SMTP) |
| `MAIL_PASS` | Password or App Password for the email account |
| `FRONTEND_PROD_URL` | Production URL of the frontend application |

You can use `.env.local` as a template.

### Running the server
-   **Development**: `npm run dev` (starts server with nodemon)
-   **Build**: `npm run build` (compiles TypeScript to JS)
-   **Production**: `npm start`
