# Attendora 🚀
**Smart Attendance & Academic Management System**

Attendora is a professional, high-performance web application designed for students to track attendance, calculate GPA, manage assignments, and visualize academic trends—all in one place.

![Attendora Banner](https://api.placeholder.com/1200/400?text=Attendora+-+Your+Academic+Co-pilot)

## ✨ Key Features

- **🤖 AI Timetable Scanner**: Upload a photo of your timetable and let AI automatically build your schedule. (Powered by OpenRouter).
- **📈 Global Attendance Engine**: Real-time tracking of classes with status labels (Present, Absent, Cancelled).
- **💎 GPA Calculator**: Track individual course grades and credits to see your current and projected GPA.
- **📝 Assignment Tracker**: Dedicated space for quizzes, exams, and projects with deadlines.
- **📊 Interactive Analytics**: View your attendance trends via modern Chart.js visualizations.
- **🔥 Gamification System**: Earn 20+ unique badges and streaks for consistency.
- **🌓 Adaptive Theme**: High-contrast dark mode and premium glassmorphism design with customizable accent themes.
- **💾 Data Portability**: Full support for CSV exports and JSON backups for your data safety.
- **📱 PWA Support**: Fully installable on mobile and desktop with offline caching via Service Workers.

## 🏗️ Project Architecture

Attendora uses a **Modular Component-Based Architecture** (ESM) to ensure high maintainability and developer efficiency.

### Directory Structure
- `src/js/core/`: State management, Firebase initialization, and core utilities.
- `src/js/features/`: Domain logic for Attendance, Schedule, Academics, and AI Scanner.
- `src/js/ui/`: UI Rendering engine, sidebar navigation, and interactive tours.
- `src/js/services/`: Data syncing, backup services, and lifecycle helpers.
- `api/`: Serverless Functions (Vercel) for secure API communication and environment variable bridging.

### Secure Bridge Pattern
Attendora implements a **Serverless Bridge Pattern**. Sensitive API keys (Firebase, OpenRouter) are kept on the backend. The frontend fetches configuration securely via the `/api/config` gateway, ensuring zero leaked keys in your public repository.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JS (ES6 Modules), HTML5, Custom CSS3 (Glassmorphism).
- **Backend**: Firebase JS SDK v12 (Firestore, Auth, Analytics).
- **AI**: OpenRouter API for intelligent timetable parsing.
- **Visualization**: Chart.js.
- **Onboarding**: Intro.js.
- **Deployment**: Vercel Serverless Architecture.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS).
- Vercel CLI (`npm install -g vercel`).
- A Firebase Project and OpenRouter API key.

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Attendora-SAT.git
   cd Attendora-SAT
   ```
2. **Setup environment variables**:
   Create a `.env` file in the root:
   ```env
   # Firebase Config (Get from Firebase Console)
   FIREBASE_API_KEY="..."
   OPENROUTER_API_KEY="..."
   # ... [See .env.example for full list]
   ```
3. **Run the developer server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

## 📄 License
Distributed under the ISC License.

---
Built with ❤️ for students by [Attendora Team]