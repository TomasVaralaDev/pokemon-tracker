# Testing Strategy

This project employs a modern testing stack prioritizing speed, developer experience, and code reliability. The testing strategy is divided into **Unit Tests** for logic and **Component Tests** for UI feedback.

## The Stack

* **[Vitest](https://vitest.dev/):** A blazing fast unit test framework powered by Vite. Used as a replacement for Jest due to its native ESM support and tight integration with the Vite build pipeline.
* **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/):** Used for rendering components and querying the DOM in a way that resembles how actual users interact with the app.
* **[JSDOM](https://github.com/jsdom/jsdom):** A simulated browser environment that allows running React tests in Node.js.

## What We Test

### 1. Unit Testing (Logic)
We isolate pure business logic and utility functions to ensure they perform data transformations correctly without side effects.

* **Target:** `src/utils.ts`
* **Scope:** Verifying string manipulation functions like `cleanName` (formatting API slugs to human-readable text) and `capitalize`.
* **Why:** These functions are used globally across the app. Breaking them would cause display errors in multiple views (Modals, Cards, Lists).

### 2. Component Testing (UI)
We verify that reusable UI components render correctly and respond to props as expected.

* **Target:** `src/components/Toast.tsx`
* **Scope:**
    * Ensuring the Toast renders the correct message.
    * Verifying visual feedback styles (Green for success, Blue for info).
* **Why:** The Toast system is the primary feedback mechanism for user actions (catching/releasing Pokémon). It is critical that users receive confirmation of their actions.

## How to Run Tests

The project is configured to run tests in "watch mode" by default during development.

```bash
# Run all tests
npm test
```

## Future Improvements

- Integration Tests: Testing the interaction between the PokemonCard and the UserCollection state.
- Mocking API: Implementing MSW (Mock Service Worker) to simulate PokéAPI responses, allowing us to test the PokemonModal data fetching logic without hitting the real network.

