# Database Schema & Security

The application uses **Google Firebase Firestore** (NoSQL) for data persistence.

## Data Model

Since NoSQL databases are document-based, the data is structured to minimize read operations. Instead of storing each catch as a separate document, a user's entire collection is stored in a single document.

### Collection: `users`
**Document ID:** `uid` (The User ID from Firebase Auth)

**Fields:**
```json
{
  "collection": {
    "1": { "caught": true, "shiny": false },
    "4": { "caught": true, "shiny": true },
    "25": { "caught": false, "shiny": false }
    // ... keys correspond to Pokemon National Dex ID
  }
}
```

## Security Rules
```bash
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Match the user document by their Auth UID
    match /users/{userId} {
      // Allow Read/Write ONLY if the request comes from an authenticated user
      // AND the Auth UID matches the Document ID.
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Environment Variables
Sensitive configuration keys are stored in .env.local and injected at build time.

- VITE_API_KEY
- VITE_AUTH_DOMAIN
- VITE_PROJECT_ID ...etc.