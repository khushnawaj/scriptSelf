# 📟 ScriptShelf: Professional User Manual & Guide

**DevArcade** is a built-in gamified suite designed to refine your developer cognitive stack. Improve your typing speed, visual memory, and color hex recognition while earning XP and maintaining streaks.

---

## 🎖️ The Streak & Badge System

Consistency is key in development. DevArcade rewards you for daily practice.

### Dual Streak Tracking
1. **Global Streak**: Your overall daily consistency across any game.
2. **Game-Specific Streak**: Tracks your mastery in individual modules (e.g., *Syntax Sprint Streak*).

**Note:** The badge bar intelligently switches to show your **Game Streak** when you are playing a specific game, allowing you to track mastery in specific skills.

### 🏅 Rank Badges
Unlock badges by maintaining your streak. Each badge represents a milestone in your developer journey.

| Badge Rank | Day Streak | Color | Description |
| :--- | :---: | :--- | :--- |
| **Hello World** | 1 Day | 🟢 Emerald | The journey begins. Unlocked on your first play. |
| **Script Kiddie** | 3 Days | 🟡 Yellow | You're getting the hang of it. |
| **Code Ninja** | 7 Days | 🟣 Violet | A week of consistent training. |
| **Full Stack** | 30 Days | 🔴 Rose | Monthly mastery. A true habit. |
| **Architect** | 60 Days | 🔵 Cyan | Elite consistency. The master builder. |

---

## 🎮 The Games

### 1. ⌨️ Syntax Sprint (Elite_Typing_Test)
*Refine your muscle memory with real world code syntax.*

- **Objective**: Type the displayed code snippet exactly as shown.
- **Mechanics**:
    - **Real-Time WPM**: Tracks your Words Per Minute live.
    - **Visual Feedback**: Correct characters glow **Green**, incorrect ones flash **Red**.
    - **SIGNAL_LINK**: Dynamic throughput meter showing your stability.
- **Scoring**: Base score of 10 XP + a Speed Bonus for WPM > 20.

### 2. 🧠 Memory Matrix (Pattern_Recognition)
*Train your visual memory with the tech stack.*

- **Objective**: Clear the grid by finding matching pairs of tech icons.
- **CORE_POWER**: Tracks your pattern recognition efficiency (Optimized at 98%+).
- **Scoring**: 50 XP base, minus 1 XP for every move taken (Minimum 10 XP). Efficiency is rewarded.

### 3. #️⃣ Hex Hunter (UI_Color_Accuracy)
*A challenge for the frontend masters.*

- **Objective**: Identify the correct Hexadecimal code for the displayed color blob.
- **Mechanics**:
    - **Streak Multiplier**: Consecutive correct answers build a "Round Streak".
    - **Feedback**: Buttons flash Green (Hit) or Red (Miss/Shake).
- **Scoring**: 15 XP Base + up to 25 XP Streak Bonus per round.

### 4. 🚀 Stack Overflow Escape (Algorithm_Navigation)
*Navigate the call stack maze.*

- **Objective**: Reach the exit door before memory usage hits 100%.
- **Mechanics**:
    - **Maze Navigation**: Use arrow keys to move through the call stack.
    - **Logic Gates**: Solve multiple-choice coding puzzles to unlock terminal doors.
- **Scoring**: 200 XP for successful escape.

### 5. ⚡ Firewall Breach (Defense_Simulation)
*System Defense & Reflex Training.*

- **Objective**: Protect the system core. Deflect the data packet (ball) to destroy security nodes (bricks).
- **Style**: A classic Breakout-style game with a cyberpunk twist.

### 6. 👾 Bug Hunter v2.5 (Full_System_Audit)
*The ultimate debugging challenge.*

- **Objective**: Fix broken code snippets under intense pressure.
- **Mechanics**:
    - **Difficulty Protocols**: Junior, Mid, and Senior tiers.
    - **System Monitor**: Live console logs and error types.
    - **Power-ups**: 🛡️ System Shield & ⏳ Time Dilation.

---

## 🤖 AI Content Protocol (Note Generation)

To maintain a high-density, professional knowledge base, follow this protocol when using **ChatGPT** or **Claude** to generate technical records for ScriptShelf.

### 📝 The "Perfect Note" Prompt Template
Copy and paste this base prompt into ChatGPT to ensure it outputs content in the correct format:

> "I am using **ScriptShelf**, a professional development repository. Generate a technical record on **[Enter Topic Here]**. 
> 
> **Requirements:**
> 1. **Format**: Strictly GitHub Flavored Markdown (GFM).
> 2. **Structure**: 
>    - Start with a clear `# Title`.
>    - Include a `## TL;DR` executive summary.
>    - Use `## Technical Deep-Dive` for the core logic.
>    - Include a `## Code implementation` block with specific syntax highlighting (e.g., ```javascript).
>    - If there is a workflow, include a **Mermaid.js** diagram using ```mermaid.
> 3. **Linking**: Use `[[Internal Title]]` for concepts that should be cross-linked.
> 4. **Metadata**: Suggest 5 high-density tags and a specific category from: (Frontend, Backend, Architecture, DevOps, Security, Database)."

### 🏛️ ADR (Architectural Decision Record) Format
For system design decisions, use the **ADR Module**:

*   **Status Tags**: State if the decision is `Proposed`, `Accepted`, or `Superseded`.
*   **Context**: What is the problem we are solving?
*   **Decision**: Why this specific tech stack/pattern?
*   **Consequences**: What are the trade-offs (Performance vs. Speed)?

### 📊 Tactical Data Visualization
ScriptShelf renders **Mermaid.js** diagrams natively. Ask AI to:
- *"Provide a Mermaid sequence diagram for this Auth flow."*
- *"Create a Mermaid Gantt chart for this implementation plan."*

---

*Keep your CORE_POWER high and your technical logic sharp!*
