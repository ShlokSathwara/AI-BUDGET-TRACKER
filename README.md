# 🏦 Smart Budget Tracker

An AI-powered budget tracking application with real-time transaction categorization, insights, and anomaly detection.

**Live App:** https://github.com/ShlokSathwara/AI-BUDGET-TRACKER

---

## 📁 Project Structure

```
Smart Budget Tracker/
├── server/                  # Backend (Node.js + Express)
│   ├── Backend/            # Mongoose-based API (MongoDB)
│   ├── index.js            # SQLite-based server (default)
│   ├── package.json
│   └── .env                # Secrets (MONGO_URI, JWT_SECRET)
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🔧 Setup Instructions

### Prerequisites

- **Node.js** v18+ (check: `node --version`)
- **npm** v9+ (check: `npm --version`)
- **MongoDB Atlas** account (Cloud database)
- **Git** installed

### Local Development

**1. Clone the repository:**
```bash
git clone https://github.com/ShlokSathwara/AI-BUDGET-TRACKER.git
cd "Smart Budget Tracker"
```

**2. Install backend dependencies:**
```bash
cd server
npm install
```

**3. Install frontend dependencies:**
```bash
cd ../client
npm install
```

**4. Configure environment variables:**

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://ShlokSathwara:Shlok#24@aibudgetsystem.be3jipx.mongodb.net/budgetDB?retryWrites=true&w=majority
JWT_SECRET=aI8kL9mN2pQ7rS5tU3vW4xY1zAbCdEfGhIjKlMnOpQrStUvWxYz
PORT=5000
```

**5. Start both servers:**

Terminal 1 (Backend):
```bash
cd server
node index.js    # SQLite server (default)
# OR
node Backend/server.js    # Mongoose server (requires MongoDB)
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

**Frontend:** http://localhost:5174/
**Backend:** http://localhost:5000/

---

## 📦 About `node_modules`

### **Can you delete node_modules?**
**YES!** `node_modules` is safe to delete because:
- It's listed in `.gitignore` (not pushed to GitHub)
- It's automatically created when you run `npm install`
- It takes up lots of space (~200MB+)

### **Reinstalling dependencies:**
```bash
# When you pull fresh code or share the project:
cd server && npm install
cd ../client && npm install
```

**The `package.json` and `package-lock.json` files tell npm what to install, so the app will always work.**

---

## 🚀 Deployment to Render

### Step 1: Add Node version file

**Create `.nvmrc` in root directory:**
```
18.18.0
```

This tells Render which Node version to use.

### Step 2: Create `server/package.json` start script

Ensure `server/package.json` has:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### Step 4: Deploy on Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your `AI-BUDGET-TRACKER` repository
5. **Settings:**
   - **Name:** `ai-budget-api`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Region:** Choose closest to you

6. **Add Environment Variables** (in Render dashboard):
   ```
   MONGO_URI = mongodb+srv://ShlokSathwara:Shlok#24@aibudgetsystem.be3jipx.mongodb.net/budgetDB?retryWrites=true&w=majority
   JWT_SECRET = aI8kL9mN2pQ7rS5tU3vW4xY1zAbCdEfGhIjKlMnOpQrStUvWxYz
   PORT = 5000
   ```

7. Click **"Deploy"** and wait ~3-5 minutes

8. Your backend URL will be: `https://ai-budget-api.onrender.com`

### Step 5: Update Frontend API URL

In `client/src/utils/api.js`:
```javascript
const base = import.meta.env.VITE_API_BASE || 'https://ai-budget-api.onrender.com';
```

Or use `.env` in client:
```
VITE_API_BASE=https://ai-budget-api.onrender.com
```

### Step 6: Deploy Frontend (Vercel or Render)

**Option A: Vercel (recommended for React)**
```bash
npm install -g vercel
cd client
vercel
```

**Option B: Render**
Same process as backend, but:
- **Build Command:** `npm run build`
- **Start Command:** `npm run preview` or use Vercel for static hosting

---

## 📊 API Endpoints

### Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| POST | `/transactions` | Save a transaction |
| GET | `/transactions` | Get all transactions |
| POST | `/categorize` | Auto-categorize a transaction |
| GET | `/budgets` | Get all budgets |
| POST | `/budgets` | Save a budget |

**Example Request:**
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":50,"merchant":"Starbucks","description":"coffee"}'
```

---

## 🔐 Environment Variables

**`server/.env`** (⚠️ DO NOT commit this file):
```env
MONGO_URI=<your-atlas-connection-string>
JWT_SECRET=<random-secret-key>
PORT=5000
```

**`client/.env`** (optional):
```env
VITE_API_BASE=http://localhost:5000
```

---

## 🧪 Testing

**Backend Tests:**
```bash
cd server
npm test
```

**Frontend:**
- Manual testing in browser: http://localhost:5174/
- Check console for errors (F12 → Console)

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux

# Kill the process and restart
```

### MongoDB connection error
- Verify `MONGO_URI` in `server/.env`
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Ensure DB user password is correct

### Frontend can't reach backend
- Check backend is running: `curl http://localhost:5000/health`
- Check `api.js` base URL
- Check browser Network tab (DevTools → Network)

---

## 📝 Quick Commands

```bash
# Development
npm run dev          # Start all (from project root with script)

# Production Build
cd client && npm run build

# Push to GitHub
git add .
git commit -m "message"
git push

# Clean and reinstall
rm -r server/node_modules client/node_modules
npm install --prefix server
npm install --prefix client
```

---

## 🌟 Features

✅ Real-time transaction tracking  
✅ AI-powered category detection  
✅ Budget management  
✅ Spending insights & anomaly detection  
✅ Responsive UI (Tailwind CSS)  
✅ MongoDB persistence  
✅ JWT authentication  

---

## 📧 Support

For issues, check:
1. GitHub Issues: https://github.com/ShlokSathwara/AI-BUDGET-TRACKER/issues
2. Console errors (F12)
3. Server logs (terminal output)

---

**Made with ❤️ by Shlok Sathwara**
