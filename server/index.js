// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
const storeRouter = require('./routes/store-router')
app.use('/store', storeRouter)

const db = require('./db/active');

async function initializeDatabase() {
    try {
        await db.connect();
        const dbName = process.env.DB_DIALECT.toUpperCase();
        console.log(`${dbName} connected successfully`);
    } catch (err) {
        console.error('Database connection error:', err);
    }
}
initializeDatabase();

// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`))
