# 📜 ScriptShelf  

**ScriptShelf** is a high-performance, senior-level MERN stack application designed for developers and power users to organize, share, and manage code snippets, documentation, and PDF resources with professional-grade productivity tools. It goes beyond simple CRUD operations to offer a fully gamified, real-time, and resilient knowledge management ecosystem.  

---  

## 🚀 Key Features  

### 📡 Real-Time Social Architecture (New)  
- **Instant Notification System**: Powered by **Redis & Socket.io**, get alerted the second someone interacts with your work (comments, likes, follows) without refreshing the page.  
- **Live Chat**: Secure, end-to-end real-time messaging with typing indicators, read receipts, and online status.  
- **Global Community Stream**: A public channel for all developers to share insights, code snippets, and resources in real-time.  
- **Visual File Sharing**: Modern, compact thumbnail previews for image/video uploads with overlay controls, inspired by leading AI interfaces.  

### 🎮 Gamification Engine (DevArcade)  
- **Reputation System**: Earn XP and level up from **Script Kiddie** to **Elite Architect** by contributing quality content.  
- **Badges & Achievements**: Unlock unique accolades for maintaining streaks, solving bugs, and mastering syntax.  
- **Interactive Leaderboards**: Compete with other developers globally.  
- **Mini-Games Suite**:  
    - **Syntax Sprint**: Typing accuracy with real-time error detection.  
    - **Memory Matrix**: Neural recognition training for tech stacks.  
    - **Hex Hunter**: Pixel-perfect color accuracy test.  
    - **Bug Hunter v2.5**: Premium multi-stage debugger simulation.  

### 🧠 Strategic Knowledge Management  
- **Architectural Decision Records (ADR)**: Document the "Why" behind system choices with specialized templates.  
- **Visual Logic (Mermaid.js)**: Native rendering of flowcharts, sequence diagrams, and ER diagrams directly within documentation.  
- **Second Brain (Bidirectional Linking)**: Support for `[[Wiki-Style Links]]` with automatic backlink discovery.  
- **PDF Deep Search**: Automatic text extraction from uploaded PDFs using `pdf-parse`, making documents fully searchable.  
- **Markdown Support**: Full GFM support with syntax highlighting and copy-to-clipboard code blocks.  

### 🛡️ Resilient Backend Architecture  
- **Redis Caching Strategy**: Implemented a **Write-Through / Cache-Aside** hybrid pattern to optimize performance.  
    - **Feed Caching**: User notification feeds are cached in Redis Lists (capped at 50 items) for microsecond-level access.  
    - **Graceful Fallback**: The system automatically detects Redis failures and transparently switches to MongoDB without downtime (Circuit Breaker pattern).  
- **Scalable Design**: Decoupled notification service allows for easy horizontal scaling.  

### 📊 Professional Analytics & Dashboard  
- **Dynamic Metrics**: Visualize note distribution, daily activity streaks, and productivity trends with Chart.js.  
- **Intelligence Briefing**: Profiles feature dynamic stats like **System Level (LVL)**, **Current XP**, and **Neural Sync Status**.  
- **Admin Console**: Advanced moderation tools to manage users, content, and system health.  

---  

## 💻 Tech Stack  

- **Frontend**: React.js, Redux Toolkit, Tailwind CSS, Framer Motion, Lucide React, Socket.io-client.  
- **Backend**: Node.js, Express.js, Socket.io.  
- **Database**: MongoDB (Primary Persistence), Redis (Caching & Pub/Sub).  
- **DevOps**: JWT Authentication, Cloudinary (Media Storage), Render/Vercel Deployment.  

---  

## 🛠️ Installation & Setup  

### Prerequisites  
- Node.js (v18+)  
- MongoDB (Local or Atlas)  
- Redis (Optional - for high performance)  

### 1. Clone the repository  
```bash  
git clone <repo-url>  
cd ScriptShelf  
```  

### 2. Backend Setup  
```bash  
cd server  
npm install  
# Create a .env file with your credentials (MONGO_URI, JWT_SECRET, REDIS_URL, etc.)  
npm run dev  
```  

### 3. Frontend Setup  
```bash  
cd client  
npm install  
# Create a .env file pointing to your backend (VITE_API_URL)  
npm run dev  
```  

---  

## 📱 Mobile Testing (Local Network)  

To test the application on your mobile phone while it's running on your laptop:  

1. **Get your Laptop's IP Address**:  
   - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your local IP (e.g., `192.168.1.5`).  
2. **Update Client `.env`**:  
   - Set `VITE_API_URL=http://<YOUR_IP>:5000/api/v1`  
3. **Run Client with Host Flag**:  
   - `cd client && npm run dev -- --host`  
4. **Access on Mobile**:  
   - Open your mobile browser and go to `http://<YOUR_IP>:5173` (or the port shown in your terminal).  

---  

## 🚀 Deployment  

### Backend (Render)  
1. Set **Root Directory** to `server`.  
2. **Build Command**: `npm install`.  
3. **Start Command**: `npm start`.  
4. **Environment Variables**: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `REDIS_URL` (optional).  

### Frontend (Vercel)  
1. Connect repository to Vercel.  
2. **Framework Preset**: `Vite`.  
3. **Environment Variable**: `VITE_API_URL` (Your deployed backend URL).  

---  

Built with ❤️ for the Developer Community.  
