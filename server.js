// Run: npm run dev (local) || npm start (prod)

// 1. import dependencies
import { app } from './app.js';

// 2. load environment variables (think of internal passwords)
const port = process.env.PORT || 3000;

// 4. listen
app.listen(port);