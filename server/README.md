# Smart Budget Tracker — Server

Quick server scaffold for the Smart Budget Tracker project.

Install dependencies and run (PowerShell):

```powershell
cd "C:\Users\shlok\OneDrive\Desktop\Smart Budget Tracker\server"
npm install
npm run dev
```

- `npm run dev` uses `nodemon` (restarts on changes).
- `npm start` runs `node index.js`.

Endpoints:
- `GET /` - basic welcome
- `GET /health` - health check
- `POST /transactions` - placeholder to receive a transaction payload

Next steps you can ask me to do:
- Add SQLite persistence and transaction model
- Implement auto-categorization endpoint
- Create a simple frontend that interacts with this server
