# 📜 ScriptShelf

**ScriptShelf** is a high-performance, senior-level MERN stack application designed for developers and power users to organize, share, and manage code snippets, documentation, and PDF resources with professional-grade productivity tools.

---

## 🚀 Key Features

### 🛠️ Developer Productivity
- **Command Palette (CMD+K)**: A global, lightning-fast interface to search notes, navigate the app, and trigger actions.
- **Smart Tagging**: Automatic keyword detection (React, Node, etc.) to organize your content without manual effort.
- **Related Notes**: Link notes together to create a personal knowledge base.
- **Markdown Support**: Full GFM (GitHub Flavored Markdown) support with syntax highlighting and copy-to-clipboard code blocks.

### 📁 Advanced Note Management
- **PDF Deep Search**: Automatic text extraction from uploaded PDFs using `pdf-parse`, making documents fully searchable.
- **Version History**: Track changes with a built-in history array—never lose a previous version of your snippets.
- **Pinned Notes**: Keep your most important scripts at the top of your dashboard.
- **Bulk Export**: Export entire categories as a structured Markdown ZIP bundle for offline reading.

### 📊 Professional Analytics
- **Dynamic Dashboard**: Visualize your note distribution by category and type.
- **Time-Series Insights**: Track your productivity with a 14-day history of note creation (powered by Chart.js).

### 👤 Profile & Social
- **Custom Links**: Add unlimited social (GitHub, LinkedIn, LeetCode) and personal links to your profile.
- **Dynamic Avatars**: Upload custom profile pictures or let the system generate stylish initials.

---

## 💻 Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Lucide React, Chart.js.
- **Backend**: Node.js, Express, MongoDB (Mongoose), PDF-Parse, Archiver.
- **Authentication**: JWT (JSON Web Token) with secure cookie storage.
- **Styling**: Premium Teal & Maroon custom design system with Glassmorphism effects.

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ScriptShelf
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Create a .env file with:
   # MONGO_URI, JWT_SECRET, JWT_EXPIRE, COOKIE_EXPIRE
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🛡️ Admin Features
- Users with the `admin` role can manage the entire user base, delete accounts, and oversee platform content.

---

Built with ❤️ for the Developer Community.
