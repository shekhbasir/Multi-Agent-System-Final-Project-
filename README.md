# 🚀 Live Classes — AI-Powered Learning, Meetings, Jobs & Coding Platform

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC%20%2F%20ZEGO-Live%20Communication-8A2BE2?style=for-the-badge" />
</p>

<p align="center">
  <strong>A modern all-in-one platform for live classes, meetings, AI-powered exams, jobs, coding practice, certificates and collaborative learning.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-api-overview">API</a>
</p>

---
<p align="center">

🌐 [Live Demo](https://talksphere-learngridbasir.vercel.app/) •
💻 [GitHub Repository](https://github.com/shekhbasir) •
🎬 [Demo Video](https://www.linkedin.com/feed/update/urn:li:activity:7490148807490289665/)

</p>

## 🌟 About The Project

**Live Classes** is a full-stack, real-time learning and professional development platform built with the **MERN Stack**.

The platform combines:

* 🎥 Live meetings and classes
* 👥 Multi-user sessions
* 🤖 AI-generated examination questions
* 📝 Online examinations
* 🧠 DSA and coding practice
* 💻 Live coding experience
* 💼 Real-time job discovery
* 🎯 Profile-based job matching
* 🏆 Automatic certificate generation
* 🧑‍💻 Collaborative whiteboard
* 🔐 Authentication and protected sessions
* 📊 User progress and session tracking

Instead of using different platforms for meetings, exams, coding practice, job discovery and certificates, this project brings these experiences together into one unified application.

---

# ✨ Key Features

## 🎥 1. Live Meeting & Class Platform

Create and participate in real-time online sessions.

### Features

* 🚀 Create live sessions
* 👑 Host-controlled meetings
* 🔗 Join sessions using room IDs
* 👥 Multi-user participation
* 🟢 Active session tracking
* 🚪 Join / Leave session
* 🛑 Host can end the session
* 🔒 Public and private sessions
* 👤 Participant management
* 📊 Session information
* 🎬 Recording-ready architecture
* ⚡ Real-time communication

The platform is designed to support large live learning and meeting sessions.

---

## 🧑‍🏫 2. Host Session

Hosts can create and manage live sessions.

A host can configure:

* Meeting title
* Description
* Meeting type
* Maximum participants
* Session status
* Session controls

The host has additional privileges such as ending the session.

---

## 👨‍🎓 3. Join Session

Users can join available sessions using the generated room ID.

The system handles:

* Session validation
* Session availability
* Participant limits
* Duplicate participation
* Session status
* User authentication
* Participant tracking

---

# 🧑‍💻 4. Live Coding Dashboard

A dedicated coding environment for improving programming skills.

### Includes

* 💻 Coding practice
* 🧠 DSA questions
* 🏢 Real-world/company-style problems
* 📚 Problem-solving practice
* 📈 Skill improvement
* 🎯 Interview preparation

The goal is to help students prepare for technical interviews while practicing problem-solving.

---

# 🧠 5. AI-Powered Examination System

One of the major features of the platform is its AI-powered examination module.

### AI capabilities

* 🤖 Automatic question generation
* 📝 Dynamic quiz creation
* 🎯 Topic-based questions
* 📊 Difficulty-based questions
* ⚡ Automatic generation based on selected requirements
* 🧩 Multiple-choice question support
* 📈 Attempt tracking
* 🏆 Result generation

AI is used to dynamically generate questions instead of requiring every question to be manually entered.

---

# 🏆 6. Automatic Certificate Generation

After successfully completing eligible sessions/exams, the platform can generate certificates automatically.

### Certificate system

* 📜 Automatic certificate generation
* 👤 User-specific certificate information
* 🏅 Completion recognition
* 🔐 Verification-oriented certificate flow
* 📥 Certificate access/download
* 🎓 Useful for learning achievements

---

# 💼 7. Real-Time Job & Opportunity Platform

The platform includes an integrated opportunity/job discovery system.

### Features

* 🔎 Job discovery
* ⚡ Real-time opportunity synchronization
* 📊 Large job/opportunity collection
* 🎯 Profile-based matching
* 🧠 Smart opportunity discovery
* 🔗 Direct application links
* 🏢 Company information
* 📍 Location-based opportunities
* 💼 Remote opportunities
* 🧑‍💻 Technology/skill-based matching

The system is designed to help users discover opportunities relevant to their profile instead of manually searching multiple websites.

---

# 🎯 8. Profile-Based Opportunity Matching

The platform can use user information and skills to help identify relevant opportunities.

For example:

```text
User Skills
    ↓
Profile Information
    ↓
Opportunity Data
    ↓
Skill Matching
    ↓
Relevant Opportunities
    ↓
Apply
```

This makes the opportunity discovery process more personalized.

---

# 🎨 9. Collaborative Whiteboard

A collaborative whiteboard experience designed for live classes and meetings.

Useful for:

* 👨‍🏫 Teaching
* 🧑‍🎓 Learning
* 🧠 Explaining concepts
* 📐 Drawing diagrams
* 💡 Brainstorming
* 👥 Collaborative sessions

---

# 🔐 10. Authentication & Security

The application includes protected user functionality and session-level access control.

### Security-oriented features

* 🔐 User authentication
* 🍪 Secure authentication flow
* 🔑 JWT-based authorization
* 🔒 Protected routes
* 👤 User-specific sessions
* 👑 Host authorization
* 🚫 Unauthorized action prevention
* 🔐 Environment-based secret management

> **Never commit `.env` files or API keys to GitHub.**

---

# 🤖 11. AI Integration

AI functionality is integrated into the application for intelligent content generation.

Possible AI-powered workflows include:

```text
User Input
    ↓
AI Service
    ↓
Prompt Processing
    ↓
AI Model
    ↓
Generated Content
    ↓
Application
```

The AI service is primarily used for automatically generating examination/quiz content.

---

# 📊 12. Session Management

The backend manages the complete lifecycle of a meeting/session.

```text
Create Session
      ↓
Generate Room ID
      ↓
Host Starts Session
      ↓
Users Join
      ↓
Participants Tracked
      ↓
Live Session
      ↓
Users Leave
      ↓
Host Ends Session
      ↓
Session Completed
```

---

# ⚡ 13. Real-Time Experience

The application is designed around real-time interactions.

Real-time functionality includes:

* Live sessions
* Participant presence
* Session state
* Live communication
* Collaborative learning
* Multi-user interaction

---

# 🌐 Complete Platform Flow

```text
                    ┌───────────────────────┐
                    │       USER            │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
        Live Classes        Opportunities       Coding
             │                  │                  │
             ▼                  ▼                  ▼
       Create / Join       Job Matching        DSA Practice
             │                  │                  │
             ▼                  ▼                  ▼
        Live Session       Apply to Jobs       Improve Skills
             │
       ┌─────┴──────┐
       ▼            ▼
   Whiteboard      Exam
                      │
                      ▼
                 AI Question
                 Generation
                      │
                      ▼
                   Attempt
                      │
                      ▼
                    Result
                      │
                      ▼
               Certificate
```

---

# 🛠️ Tech Stack

## Frontend

* ⚛️ React.js
* ⚡ Vite
* 🎨 Tailwind CSS
* 🎬 Framer Motion
* 🧩 React Icons
* 🌐 REST API integration
* 🎥 ZEGO real-time communication
* 🖥️ Modern responsive UI

## Backend

* 🟢 Node.js
* 🚂 Express.js
* 🔐 JWT Authentication
* 🍪 Cookie-based authentication
* 🔌 Socket-based real-time functionality
* 🤖 Gemini AI integration
* 🌐 REST APIs

## Database

* 🍃 MongoDB
* ☁️ MongoDB Atlas
* 📦 Mongoose

## External Services

* 🤖 Google Gemini API
* 🎥 ZEGO Cloud
* 💼 Adzuna Job API
* ☁️ MongoDB Atlas

---

# 📁 Project Structure

```text
PROJECT/
│
├── Backend/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend/
│   │
│   └── basir/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── vite.config.js
│       └── .env
│
└── README.md
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Then move into the project directory:

```bash
cd YOUR_PROJECT_FOLDER
```

---

# 🔧 Backend Setup

Open the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backend` directory:

```text
CLIENT_URL=http://localhost:5173
PORT=7000

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

SECRET_KEY=YOUR_SECRET_KEY
REFRESH_SECRET_KEY=YOUR_REFRESH_SECRET_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

ADZUNA_APP_ID=YOUR_ADZUNA_APP_ID
ADZUNA_APP_KEY=YOUR_ADZUNA_APP_KEY
```

Then start the backend:

```bash
npm run dev
```

Backend will normally run on:

```text
http://localhost:7000
```

---

# 🎨 Frontend Setup

Open a **new terminal**.

Go to the frontend:

```bash
cd Frontend
```

Then enter the React/Vite project:

```bash
cd basir
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside:

```text
Frontend/basir/
```

Add:

```text
VITE_ZEGO_APP_ID=YOUR_ZEGO_APP_ID
VITE_ZEGO_SERVER_SECRET=YOUR_ZEGO_SERVER_SECRET
```

Then start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables — Where To Get Them

## 🍃 MongoDB URI

Create a MongoDB Atlas account and create a database cluster.

Then:

```text
MongoDB Atlas
    ↓
Database
    ↓
Connect
    ↓
Drivers
    ↓
Copy Connection String
```

Your `.env` value will look similar to:

```text
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME
```

Replace the username, password and database name with your own values.

---

# 🤖 Gemini API Key

The AI-powered question generation requires a Gemini API key.

General process:

```text
Google AI / Gemini API Platform
        ↓
Sign in
        ↓
Create / Select Project
        ↓
Create API Key
        ↓
Copy API Key
        ↓
Add it to Backend/.env
```

Use:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**Do not publish the key on GitHub.**

---

# 💼 Adzuna API Credentials

The opportunity/job module uses Adzuna API credentials.

General process:

```text
Adzuna Developer Account
        ↓
Create / Register Application
        ↓
Get App ID
        ↓
Get App Key
        ↓
Add credentials to .env
```

Use:

```text
ADZUNA_APP_ID=YOUR_ADZUNA_APP_ID
ADZUNA_APP_KEY=YOUR_ADZUNA_APP_KEY
```

---

# 🎥 ZEGO Cloud Credentials

ZEGO is used for real-time communication functionality.

General process:

```text
ZEGO Cloud
    ↓
Create Account
    ↓
Create Project
    ↓
Create Application
    ↓
Get App ID
    ↓
Get Server Secret
```

Then add:

```text
VITE_ZEGO_APP_ID=YOUR_ZEGO_APP_ID
VITE_ZEGO_SERVER_SECRET=YOUR_ZEGO_SERVER_SECRET
```

> ⚠️ Keep your credentials private and never commit your real `.env` file.

---

# 🔐 Important: `.gitignore`

Before pushing your project to GitHub, make sure `.env` files are ignored.

Example:

```gitignore
node_modules/
.env
.env.local
.env.development
.env.production
dist/
build/
```

You can commit an example environment file instead:

```text
.env.example
```

Example:

```text
CLIENT_URL=http://localhost:5173
PORT=7000

MONGO_URI=

SECRET_KEY=
REFRESH_SECRET_KEY=

GEMINI_API_KEY=

ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

For frontend:

```text
VITE_ZEGO_APP_ID=
VITE_ZEGO_SERVER_SECRET=
```

---

# 🧪 Run The Complete Project Locally

You need **two terminals**.

### Terminal 1 — Backend

```bash
cd Backend
npm install
npm run dev
```

### Terminal 2 — Frontend

```bash
cd Frontend
cd basir
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🔄 Development Workflow

```text
Clone Repository
      ↓
Install Backend Dependencies
      ↓
Configure Backend .env
      ↓
Start Backend
      ↓
Install Frontend Dependencies
      ↓
Configure Frontend .env
      ↓
Start Frontend
      ↓
Open Application
      ↓
Register / Login
      ↓
Use Platform
```

---

# 🔌 API Overview

The backend follows a modular REST API architecture.

Major API areas include:

### 🔐 Authentication

```text
Register
Login
Logout
User Details
Authentication / Authorization
```

### 🎥 Sessions

```text
Create Session
Join Session
Leave Session
End Session
Get My Sessions
Get Active Sessions
Get Session Details
Get Session Participants
```

### 🤖 AI / Quiz

```text
Generate Questions
Create Quiz
Start Attempt
Submit Answers
Calculate Result
Track Attempt
```

### 💼 Opportunities

```text
Sync Opportunities
Fetch Opportunities
Filter Opportunities
Match Opportunities
Opportunity Details
```

### 🏆 Certificates

```text
Certificate Generation
Certificate Access
Certificate Verification
```

> API routes can change as the application evolves. Refer to the backend `routes/` directory for the current implementation.

---

# 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │      React + Vite    │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                       REST / Socket
                            │
                            ▼
                 ┌──────────────────────┐
                 │    Express + Node    │
                 │      Backend         │
                 └──────────┬───────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      MongoDB            Gemini           External APIs
      Atlas                AI               Adzuna
          │                                   │
          │                                   │
          └─────────────────┬─────────────────┘
                            │
                            ▼
                      ZEGO Cloud
                   Real-Time Services
```

---

# 📌 Main Modules

| Module            | Purpose                            |
| ----------------- | ---------------------------------- |
| 🔐 Authentication | Secure user access                 |
| 👤 User Profile   | Manage user information            |
| 🎥 Live Sessions  | Create and join meetings           |
| 👑 Host Controls  | Manage live sessions               |
| 👥 Participants   | Track session members              |
| 🎨 Whiteboard     | Collaborative learning             |
| 🤖 AI Quiz        | Automatic question generation      |
| 📝 Examination    | Online assessment                  |
| 🏆 Certificates   | Automatic achievement certificates |
| 💼 Opportunities  | Job and opportunity discovery      |
| 🎯 Matching       | Profile-based opportunity matching |
| 💻 Coding         | DSA and interview preparation      |
| ⚡ Real-Time       | Live communication and interaction |

---

# 🎯 Why This Project?

The main goal is to create a unified ecosystem where students and learners can:

```text
LEARN
  ↓
ATTEND LIVE CLASSES
  ↓
PRACTICE DSA
  ↓
TAKE AI-POWERED EXAMS
  ↓
EARN CERTIFICATES
  ↓
DISCOVER JOBS
  ↓
MATCH WITH OPPORTUNITIES
  ↓
APPLY
```

This makes the platform useful not only for online learning but also for **career preparation and professional development**.

---

# 🚀 Future Enhancements

Planned improvements can include:

* 📱 Dedicated mobile application
* 🔔 Push notifications
* 📧 Email notifications
* 🧠 More advanced AI personalization
* 📊 Advanced analytics dashboard
* 🏢 Company-specific coding tracks
* 🎯 Advanced recommendation engine
* 🏆 Gamification and leaderboards
* 📚 Course management system
* 👨‍🏫 Instructor dashboard
* 📈 Advanced learning analytics
* 🔎 More opportunity providers
* 🔐 Stronger certificate verification
* ☁️ Improved cloud scalability

---

# 🔒 Security Notes

Never commit these files:

```text
.env
.env.local
.env.production
```

Never publish:

```text
MongoDB Password
JWT Secret
Refresh Token Secret
Gemini API Key
Adzuna API Key
ZEGO Server Secret
```

If a secret is accidentally pushed to GitHub:

1. Remove it from the repository.
2. Rotate/revoke the exposed credential.
3. Generate a new credential.
4. Update your deployment environment.
5. Check Git history if the secret was committed previously.

---

# 🧑‍💻 Contributing

Contributions are welcome!

### 1. Fork the repository

```bash
git fork
```

### 2. Clone your fork

```bash
git clone YOUR_FORK_URL
```

### 3. Create a branch

```bash
git checkout -b feature/new-feature
```

### 4. Make your changes

### 5. Commit

```bash
git add .
git commit -m "feat: add new feature"
```

### 6. Push

```bash
git push origin feature/new-feature
```

### 7. Create a Pull Request

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

It helps support the project and motivates further development.

---

# 📜 License

This project is available for educational and development purposes.

Add your preferred license here if you decide to publish the project under an open-source license.

---

# 👨‍💻 Developer

## Sheikh Basir

**Full Stack Developer | MERN Stack | AI | Cloud & Real-Time Applications**

Interested in building modern full-stack applications, AI-powered products, real-time systems and scalable cloud-based solutions.

---

# 🌐 Project Links

### 🚀 Live Application

```text
https://talksphere-learngridbasir.vercel.app/
```

### 💻 GitHub Repository

```text
https://github.com/shekhbasir/Multi-Agent-System-Final-Project-
```

---

<p align="center">
  <strong>Built with ❤️ using MERN, AI, Real-Time Technologies & Modern Web Development.</strong>
</p>

<p align="center">
  🚀 Learn • Code • Connect • Practice • Get Certified • Get Opportunities 🚀
</p>

<p align="center">
  ⭐ Star this repository if you like the project!
</p>





<h1>THIS ALL ARE THE GALLARY</h1>
