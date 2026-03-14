# VibeSnap 🎵

VibeSnap is an AI-powered web application that suggests songs based on the user's mood or vibe.
Users can explore songs, save their favorites, and discover new music that matches their feelings.

The goal of this project is to make music discovery easier and more personalized using AI.

---

## ✨ Features

* 🎧 Get song suggestions based on mood or vibe
* 🤖 AI-powered recommendation system
* 🔐 User authentication (signup/login)
* ❤️ Save your favorite songs
* 📊 Admin dashboard for managing users
* 🎵 Embedded music player for listening to songs

---

## 🛠 Tech Stack

Frontend

* React
* TypeScript
* Vite
* CSS

Backend

* Node.js
* Express.js

Database

* MongoDB

AI Integration

* Google Gemini API

Music Integration

* Spotify Embed Player

---

## 📂 Project Structure

```
vibesnap/
│
├── components/        # React UI components
├── models/            # Database models
├── services/          # API services (Gemini AI)
├── server.ts          # Backend server
├── App.tsx            # Main React app
├── index.tsx          # App entry point
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Clone the repository

```
git clone https://github.com/Kaif145/vibeSnap.git
cd vibeSnap
```

### 2. Install dependencies

```
npm install
```

### 3. Create environment variables

Create a `.env` file and add:

```
MONGODB_URI=your_mongodb_connection
GEMINI_API_KEY=your_api_key
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_secret
```

### 4. Run the project

```
npm run dev
```

The app will run on:

```
http://localhost:3000
```

---

## 🌍 Deployment

This project can be deployed using platforms like:

* Render (backend)
* Vercel (frontend)
* MongoDB Atlas (database)

---

## 📌 Future Improvements

* Better AI music recommendations
* Playlist generation
* Social sharing for songs
* Mobile-friendly UI improvements

---

## 👨‍💻 Author

Kaifur Rahaman
BCA Student | Aspiring Software Engineer

---

⭐ If you like this project, consider giving it a star on GitHub!

 
