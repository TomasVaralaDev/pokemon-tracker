# Architecture & Technical Decisions

This document outlines the technical architecture, design decisions, and data flow of the Pokémon Tracker application.

## Data Flow Strategy

The application uses a **hybrid data strategy** to ensure responsiveness and offline capabilities:

1.  **Initial Load:** The app loads immediately using a "Guest Mode" strategy, pulling data from `localStorage`.
2.  **Authentication Layer:** `Firebase Auth` listens for user state changes.
3.  **Synchronization:**
    * **If Logged In:** The app subscribes to a real-time `onSnapshot` listener from **Firestore**. Any change in the cloud reflects instantly in the UI.
    * **Optimistic UI:** When a user marks a Pokémon as caught, the UI updates *immediately* (local state) before waiting for the server response. This ensures a lag-free experience.
    * **Background Sync:** The change is sent to Firestore in the background.

## Component Structure

The application follows a pragmatic component structure:

* **`App.tsx` (Controller):** Acts as the "Smart Component". It manages global state (User, Collection, Filters), handles Firebase synchronization, and passes data down to children.
* **`PokemonCard.tsx` (Presentational):** A "Dumb Component" responsible only for rendering a single card. It has internal state only for fetching its specific type data (Fire/Water etc.) to optimize initial page load performance.
* **`PokemonModal.tsx` (Feature):** Handles complex logic including:
    * Deep data fetching (Species data, Evolution chains, Type calculations).
    * **Recursive Rendering:** Uses the internal `<EvoChain />` component to render nested evolution trees of arbitrary depth.
    * **Math Logic:** Calculates type weaknesses dynamically by aggregating damage multipliers from all types.
* **`StatsModal.tsx` (Analytics):** Pure calculation component that derives statistics from the passed `collection` prop without needing its own API calls.

## Key Technical Challenges Solved

### 1. The "Any" Type Problem
Strict TypeScript interfaces (`UserCollection`, `PokemonBasic`) were implemented to replace initial `any` types, ensuring type safety across the application, especially for API responses.

### 2. Recursive Evolution Chains
Pokémon evolutions are not linear (e.g., Eevee has 8 branches). A recursive component strategy was used to traverse the `chain` object provided by PokéAPI, allowing for flexible rendering of any evolution structure.

### 3. Performance & Virtualization
* **Infinite Scroll:** Instead of rendering 1000+ DOM elements at once, the app renders chunks of 50 items. Additional items are loaded as the user scrolls, keeping the DOM light.
* **Debounced Search:** (Implemented via efficient filtering) to prevent UI locking during typing.

## PWA Implementation
The app uses `vite-plugin-pwa` to generate a Service Worker.
* **Manifest:** configured for "standalone" display.
* **Caching:** Assets are cached for offline usage.
* **Theme Color:** Matches the OS theme preference.