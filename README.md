# 🐹 GuineaDay

**GuineaDay** is a cozy, wholesome web application designed to bring joy to your daily routine. Combining a productivity task manager with an interactive guinea pig game, it's the perfect way to stay organized while getting your daily dose of cuteness.

![GuineaDay Banner](src/assets/hachi.png) <!-- You can replace this with a screenshot later -->

## ✨ Features

### 🎮 Flying Guinea Pig Game
Feed your favorite guinea pigs and watch them fly!
- **Meet the Team**: Hachi, Kui, Nova, Elmo, Mel, Haru, and **Seven**!
- **Two Ways to Play**:
  - **Hand Gestures**: Uses your webcam and AI (MediaPipe) to track your hand. Close your hand (✊) to grab a pig and drop it on the food!
  - **Mouse/Touch**: Simply click and drag to play.
- **Dynamic Physics**: Watch them bounce around the screen.

### 📋 Daily Task Manager
Keep track of your pet care routines or personal to-dos.
- **Add & Organize**: Create tasks with categories (Feeding 🥦, Cleaning 🧹, Grooming ✂️, etc.).
- **Track Progress**: Mark tasks as done and keep your day productive.
- **Simple UI**: Clean, distraction-free interface.

### 📷 Photo Gallery
A dedicated space to cherish your memories.
- **Upload & Tag**: Upload photos and tag your guinea pigs.
- **Filter**: Easily find photos of specific pigs.
- **Organize**: Keep your pet photos sorted and accessible.

### 🌤️ Smart Dashboard
- **Date & Weather**: Live weather updates for your location (powered by Open-Meteo).
- **Navigation**: Easy access to the Game, Tasks, and Photo Gallery.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (for animations)
- **Backend**: Python (FastAPI)
- **Database**: SQLite (via SQLAlchemy)
- **AI/Computer Vision**: MediaPipe Hands

## 🚀 Getting Started

Follow these instructions to set up the project locally. You will need to run both the **Backend** and **Frontend** terminals.

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)

### 1️⃣ Backend Setup (Python)
The backend handles task data storage.

```bash
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic requests

# Start the server
uvicorn main:app --reload --port 8000
```

### 2️⃣ Frontend Setup (React)
The frontend runs the game and UI.

Open a **new terminal**:
```bash
cd guinea-pig-gateway # (If not already in root)

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open your browser and navigate to the link shown (usually `http://localhost:8080`).

## 📸 Screenshots
*(Add screenshots of your game and task manager here!)*

## 📄 License
This project is for educational and personal use.

---
*Made with ❤️, 🥕, and lots of 🥬*
