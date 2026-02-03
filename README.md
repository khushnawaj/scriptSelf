# 📜 ScriptShelf

**ScriptShelf** is a high-performance, senior-level MERN stack application designed for developers and power users to organize, share, and manage code snippets, documentation, and PDF resources with professional-grade productivity tools.

---

## 🚀 Key Features

### 🧠 Strategic Knowledge Management (Senior Level)
- **Architectural Decision Records (ADR)**: Document the "Why" behind system choices with specialized templates and status tracking (Proposed, Accepted, Deprecated).
- **Visual Logic (Mermaid.js)**: Native rendering of flowcharts, sequence diagrams, and ER diagrams directly within documentation.
- **Second Brain (Bidirectional Linking)**: Support for `[[Wiki-Style Links]]` with automatic backlink discovery. Notes grow into an interconnected knowledge web.
- **Logic Patterns**: Dedicated classification for Best Practices and Anti-Patterns to serve as a living handbook for teams.
- **Obsidian-Compatible Export**: Markdown bundles now include YAML frontmatter, ready for local sync or Obsidian integration.

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
- **Styling**: Premium Vibrant Indigo & Violet design system with high-contrast accessibility.

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

## 🛡️ Enhanced Admin Features
- **System-Wide Moderation**: Admins have visibility and control over all notes in the system, including private vaults, to ensure platform integrity.
- **User Role Management**: Promote or demote users to/from admin roles directly from the management console.
- **Advanced System Stats**: Real-time tracking of total users, system-wide notes, and global categories.
- **Cleanup Tools**: Remove users and their associated records with one click.

---

Built with ❤️ for the Developer Community.

---

## 🚀 Deployment

### Backend (Render)
1. Set the **Root Directory** to `server`. (Crucial! Render needs to know where `package.json` is).
2. Set the **Build Command** to `npm install`.
3. Set the **Start Command** to `npm start`.
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long random string.
   - `CLIENT_URL`: The URL of your deployed frontend.

### Frontend (Vercel)
1. Connect your repository to Vercel.
2. The **Framework Preset** should be `Vite`.
3. Add the following **Environment Variable**:
   - `VITE_API_URL`: The URL of your deployed backend.
4. Vercel will automatically use the `vercel.json` provided in the `client` folder for routing.
