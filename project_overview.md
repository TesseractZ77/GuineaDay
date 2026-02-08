# GuineaDay Project Overview

## 🐹 Application Summary
**GuineaDay** is a comprehensive web application that combines productivity with entertainment, centered around a guinea pig theme. It features an interactive game, a task manager for pet care, and a photo gallery for memories.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (v18) with TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - **Tailwind CSS**: For responsive and utility-first styling
  - **Framer Motion**: For complex animations and page transitions
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy ORM)
- **Validation**: Pydantic models
- **Static Files**: Mounted endpoints for serving uploaded user content

### AI & Integrations
- **Computer Vision**: MediaPipe Hands (Google) for webcam-based hand gesture control in the game.
- **External API**: Open-Meteo API for real-time weather data.

## ✨ Key Features

### 1. Flying Guinea Pig Game
A physics-based interactive game where users feed guinea pigs.
- **Interaction Modes**:
  - **Hand Gesture Control**: Users can use their webcam to "grab" guinea pigs virtually using a fist gesture (✊) tracked by MediaPipe.
  - **Mouse/Touch Control**: Standard drag-and-drop mechanics.
- **Characters**: 7 unique guinea pigs (Hachi, Kui, Nova, Elmo, Mel, Haru, Seven).
- **Mechanics**: Collision detection, gravity simulation, and score tracking.

### 2. Task Manager
A simplified to-do list optimized for daily routines.
- **Features**: 
  - Create, Read, Update, Delete (CRUD) tasks.
  - Categorization (Feeding, Cleaning, Grooming, Health, General).
  - Persistence via SQLite database.
  - Visual status indicators (completed/pending).

### 3. Photo Gallery
A digital scrapbook for guinea pig memories.
- **Photo Upload**: Support for image uploading with captions.
- **Tagging System**: Tag specific guinea pigs in photos.
- **Filtering**: View photos of a specific guinea pig or view all.
- **Storage**: Local file system storage for images.

### 4. Smart Dashboard
The central hub of the application.
- **Weather Widget**: Displays real-time temperature and weather conditions based on location.
- **Date Display**: dynamic greeting and date.
- **Navigation**: Animated menu system to access different modules.
