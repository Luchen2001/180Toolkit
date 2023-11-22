import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import cors from "cors";
import mongoose from "mongoose";
import cashflowRoute from "./routes/cashflow.mjs";
import settingRoute from "./routes/setting.mjs";
import adminRoute from "./routes/admin.mjs"
import stocksRoute from './routes/stocks.mjs'
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const whitelist = "http://localhost:80";
const PASSWORD = process.env.PASSWORD;
const USERNAME = process.env.USERNAME;
const SECRET_KEY = process.env.SECRET_KEY;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const dbURI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}`;

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: true,
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use(express.urlencoded({limit: '5mb', extended: true }));

app.use(express.json({ limit: '5mb' }));

mongoose
  .connect(dbURI)
  .then((result) =>
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    })
  )
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send(`Home page: ${DB_HOST}`);
});

// Dummy login endpoint (for simplicity)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username == USERNAME && password == PASSWORD) {
    const token = jwt.sign({ username: username }, SECRET_KEY, {
      expiresIn: "30d",
    });
    return res.json({ token: token }); // Added return here.
  }
  return res.status(400).send("Username or password is not correct");
});

// Middleware to validate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.use("/api", authenticateToken); // All routes under /api will require authentication

app.use("/api/cashflow", cashflowRoute);

app.use("/api/setting", settingRoute);

app.use("/api/admin", adminRoute);

app.use("/api/stocks", stocksRoute);



