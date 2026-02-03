# 🔴 Pokémon Tracker (PWA)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)

A modern, responsive, and full-stack Progressive Web Application (PWA) designed to help trainers track their Pokémon collection across all generations.

This application features real-time cloud synchronization, advanced filtering, and detailed data analysis including dynamic type weakness calculations and recursive evolution chains.

🔗 **Live Demo:** [LISÄÄ VERCEL LINKKI TÄHÄN](https://sinun-projektisi.vercel.app)

---

## ✨ Key Features

### 📱 User Experience & PWA
-   **Installable App:** Fully functional PWA that can be installed on iOS and Android home screens.
-   **Responsive Design:** Optimized for both desktop and mobile layouts using Tailwind CSS.
-   **Dark Mode:** Built-in theme switcher with persistent preference saving.
-   **Offline Capable:** Caches assets for performance and basic offline functionality.

### ☁️ Backend & Data
-   **Real-time Sync:** Uses **Firebase Firestore** to sync collection data instantly across devices when logged in.
-   **Authentication:** Secure Google Sign-In via **Firebase Auth**.
-   **Guest Mode:** Fully functional for non-logged-in users using LocalStorage.
-   **Data Portability:** Export and Import collection data as JSON backups.

### 🧠 Advanced Logic
-   **Recursive Evolution Chains:** Visualizes complex evolution trees (including branching evolutions like Eevee) using recursive React components.
-   **Dynamic Weakness Calculation:** Fetches type data from PokéAPI and mathematically calculates damage multipliers (2x, 4x, 0.5x, 0x) to show true weaknesses.
-   **Smart Filtering:** Filter by Gen 1-9, Caught status, Missing, or Shiny forms.
-   **Global Search:** Instant search with keyboard shortcuts (`/` to search).

### 📊 Statistics
-   **Visual Progress:** Progress bars for each Generation.
-   **Collection Stats:** Total completion percentage and Shiny counters.

---

## 📸 Screenshots

| Desktop View | Mobile View |
|:---:|:---:|
| ![Desktop](PLACEHOLDER_IMAGE_URL) | ![Mobile](PLACEHOLDER_IMAGE_URL) |
| *Replace with your screenshot* | *Replace with your screenshot* |

---

## 🛠️ Tech Stack

* **Frontend:** React (Hooks, Functional Components), TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Backend as a Service:** Firebase (Authentication, Firestore Database)
* **Data Source:** [PokéAPI](https://pokeapi.co/)
* **Deployment:** Vercel

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/pokemon-tracker.git](https://github.com/YOUR_GITHUB_USERNAME/pokemon-tracker.git)
cd pokemon-tracker

2. Install dependencies

npm install

3. Configure Environment Variables

Create a .env.local file in the root directory. You need to set up a Firebase project to get these keys.

VITE_API_KEY=your_api_key_here
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id

4. Run the development server

npm run dev

Open http://localhost:5173 in your browser.

📂 Project Structure

src/
├── components/       # Reusable UI components
│   ├── PokemonCard.tsx   # Individual card with shiny/caught toggle
│   ├── PokemonModal.tsx  # Detailed view with recursion & API logic
│   ├── StatsModal.tsx    # Statistics calculation
│   └── Toast.tsx         # Notification system
├── App.tsx           # Main application logic & State management
├── firebase.ts       # Firebase initialization
├── types.ts          # TypeScript interfaces
└── main.tsx          # Entry point

🔒 Security Rules (Firestore)

The database is secured using Firestore Rules to ensure users can only modify their own data:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

📄 License

This project is open source. Made with ❤️ by Tomas Varala