# Revive Motion 🏃‍♂️🔄

> **Dual-Mode Fitness Continuity & Recovery Application**  
> *Internal Hackathon Local Prototype*

**Revive Motion** is a dual-mode fitness habit continuity application designed to solve the drop-off cycle. Its core innovation is identifying **why** a user is becoming inconsistent before activating **Rescue Mode**, offering gentle, barrier-specific micro-interventions rather than guilt, streaks, or punishment.

---

## 🌟 Core Value Proposition

A missed workout does not mean low motivation. The user may be:
- **Busy** (lack of time) $\rightarrow$ *2-minute movement reset*
- **Tired** (fatigue) $\rightarrow$ *Gentle recovery movement*
- **Stressed / low in mood** $\rightarrow$ *Breathing & light mobility*
- **Bored** $\rightarrow$ *Try something different*
- **Finding it too difficult** $\rightarrow$ *Beginner-friendly version*
- **Forgetful** $\rightarrow$ *Choose a better reminder time*
- **Routine disrupted** $\rightarrow$ *Flexible routine reset*
- **Experiencing pain** $\rightarrow$ **Safety Pause** (no exercise, rest & professional care advisory)

When inconsistency continues or risk becomes high, the app enters **Rescue Mode**—giving the user **exactly one safe, low-effort micro-action** (e.g. 1-minute starter) that helps them return without guilt.

---

## ⚕️ Non-Medical Limitation

**Revive Motion is a fitness habit-support application, not a medical or psychological diagnosis system.**
- It does **not** claim the user is depressed or has any mental-health condition.
- It does **not** diagnose medical conditions or injuries.
- It does **not** use AI for risk scoring, injury detection, or exercise generation.
- If physical pain or discomfort is reported, **Safety Pause** is activated immediately, no exercise is prescribed, and the user is advised to rest and seek qualified medical care if needed.

---

## 🛠️ Tech Stack & Architecture

- **Frontend** (`/frontend`):
  - React 18 + TypeScript + Vite
  - Tailwind CSS (mobile-first, calm palette)
  - React Router v6
  - Recharts (movement & continuity visualization)
  - Lucide React (clean, accessible icons)
  - Axios API client
- **Backend** (`/backend`):
  - Node.js (v20+) + Express + TypeScript
  - Native SQLite (`node:sqlite` DatabaseSync) — 100% local file (`revive_motion.db`), zero cloud dependencies, zero native C++ compilation issues
  - CORS enabled for local frontend
  - Transparent deterministic rule engine for barrier resolution and risk scoring
- **Database Schema**:
  - `users`, `profiles`, `activity_history`, `checkins`, `risk_states`, `interventions`, `recovery_events`, `demo_users`

---

## 🚀 Quick Run Instructions

### Prerequisites
- Node.js (v20 or higher, tested on v24.13.0)
- npm (v10 or higher)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

### 2. Run Backend Locally

In the `/backend` directory:
```bash
npm run dev
```
The backend server will start on: **`http://localhost:5000`**  
Health check endpoint: `http://localhost:5000/api/health`

---

### 3. Run Frontend Locally

In the `/frontend` directory:
```bash
npm run dev
```
The application will open on: **`http://localhost:5173`**

---

### 4. Seed & Reset Demo Data

**Seed pre-configured 4-day demo data via CLI:**
```bash
cd backend
npm run seed
```

**Or reset directly from the UI:**
Click the **"Reset"** button in the sticky top Hackathon Demo Banner at any time!

---

## ⏱️ The 3-Minute Hackathon Demo Journey

You can experience the complete end-to-end journey in under 3 minutes:

1. **Open the App** at `http://localhost:5173`.
2. Click **"Try Demo"** on the landing screen to instantly launch a personalized session.
3. Observe the **Normal Mode Dashboard** (Green badge, 10-minute beginner movement, consistency & comeback scores).
4. Click **"I’m struggling today"** or **"Daily check-in"**.
5. Select a reason (e.g. **"I did not have enough time"**, **2 min** available) and submit **"Find my next step"**.
6. The app identifies the barrier and prescribes the **2-minute movement reset** intervention.
7. Click **"Start this action"** and **"Mark Action Complete"**.
8. Notice the supportive recovery notification: *"You returned today. Small actions still count."* and view the updated **Recovery Hub**.
9. **Test Rescue Mode**:
   - In the top demo banner, click **"Day 4: Rescue"** (or select fatigue + multiple missed sessions).
   - High risk (65+) triggers **Rescue Mode** (Amber badge).
   - See the single 1-minute micro-action: **"One-minute starter"** with a live progress timer. Zero guilt, no broken streaks.
   - Click **"Complete action & return"** $\rightarrow$ Risk drops by 10, recovery score improves, mode steps down to Light/Normal.
10. **Test Safety Pause**:
    - Do a check-in and check **"I am experiencing physical pain or discomfort"**.
    - Watch **Safety Pause** activate immediately with care instructions and zero exercise prescription.

---

## 🧪 Automated Verification

To run the automated verification test suite (tests barrier inference, risk scoring math, mode transitions, and demo progression):

```bash
cd backend
npm test # or: npx tsx src/test/verifyAll.ts
```

All 19 verification points run against SQLite and pass with zero failures.
