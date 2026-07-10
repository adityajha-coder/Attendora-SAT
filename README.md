# 🗓️ Attendora: Smart Attendance Tracker

Attendora is a modern, AI-powered web application designed to help students stay on top of their academic journey. Built with a focus on deep glassmorphism aesthetics and performance, it offers an intuitive dashboard to track attendance, manage schedules, and calculate GPA with ease.

## ✨ Features

- **🚀 Google-Only Authentication**: Seamless, one-tap sign-in using Google. No complex passwords to remember.
- **📱 PWA Ready**: Install Attendora on your mobile device for a native-app-like experience.
- **🤖 AI Timetable Scanner**: Upload a picture of your schedule, and our AI (powered by Llama 3.2 Vision and GPT-4o-mini) will automatically parse and set up your weekly classes.
- **📊 Real-time Attendance Insights**: Get predictive goal tracking and "Bunk Planner" logic to see if you can safely miss a class.
- **🏆 Gamification**: Stay motivated with unlockable achievements and performance tiers.
- **📈 Comprehensive Reports**: Visualize your attendance trends and export your full history to CSV.
- **🎓 GPA Calculator**: Integrated tools to track your credits and calculate your semester GPA.
- **☁️ Firebase Cloud Sync**: Your data is always safe and synced across devices in real-time.

## 🏗️ Architecture

Attendora uses a highly modular, component-based frontend architecture:

- **Core**: State management, utilities, and Firebase initialization.
- **Features**: Distinct modules for Schedule, Attendance, Academics, and Scanner.
- **UI & Components**: Modular HTML fragments and UI handlers for a cleaner codebase.
- **Services**: Dedicated services for data persistence and cloud synchronization.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS (ES6 modules), HTML5, CSS3 (Custom Design System).
- **Icons & Graphics**: FontAwesome / Custom SVG paths.
- **Backend**: Firebase Authentication (Google Auth), Cloud Firestore (NoSQL).
- **AI Processing**: OpenRouter API (Llama 3.2 Vision / GPT-4o-mini fallback).
- **Deployment**: Vercel.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project
- An OpenRouter API key (for AI scanning features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/attendora.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   OPENROUTER_API_KEY=your_key_here
   ```

4. **Initialize Firebase Config**:
   Update `src/js/core/firebase-config.js` with your Firebase project credentials.

5. **Run the local development server**:
   ```bash
   npm run dev
   ```

## 📝 License

This project is licensed under the ISC License.