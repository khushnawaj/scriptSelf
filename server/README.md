# ScriptShelf API

Backend API for ScriptShelf - A high-performance, developer-centric documentation and note-saving platform.

## Getting Started

### Prerequisites

- Node.js
- MongoDB (Running locally or cloud URI)

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Rename `.env` (already created) and update variables if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scriptshelf
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
```

### Running the Server

- **Development Mode** (with Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Notes
- `GET /api/v1/notes` - Get all notes (Searchable via `?search=keyword`)
- `POST /api/v1/notes` - Create note (Supports File/PDF Upload)
- `GET /api/v1/notes/:id` - Get note (Populates relatedNotes)
- `PUT /api/v1/notes/:id` - Update note (Creates version history)
- `DELETE /api/v1/notes/:id` - Delete note
- `GET /api/v1/notes/export` - Export category notes as ZIP
- `GET /api/v1/categories/:categoryId/notes` - Get notes by category
- `GET /api/v1/notes/stats` - (Static method via model) Get Advanced Analytics
