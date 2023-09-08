import express from "express";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cashflowRoute from "./routes/cashflow.mjs";
import Company from "./models/company.mjs";

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD || "defaultPassword";
const USERNAME = process.env.USERNAME || "defaultUsername";
const SECRET_KEY =
  process.env.SECRET_KEY || "ONEeiGhtyM@arketsTOOLKITapplication";

const app = express();

// connect to MongoDB
const dbURI =
  "mongodb+srv://luchen:luchen@180markets.gk82dsd.mongodb.net/180toolkit?retryWrites=true&w=majority";
//mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology: true});
mongoose
  .connect(dbURI)
  .then((result) =>
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    })
  )
  .catch((err) => console.log(err));

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Home page");
});

// Dummy login endpoint (for simplicity)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username == USERNAME && password == PASSWORD) {
    const token = jwt.sign({ username: username }, SECRET_KEY, {
      expiresIn: "7d",
    });
    return res.json({ token: token }); // Added return here.
  }
  return res.status(400).send("Username or password is not correct");
});

// Middleware to validate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.use("/api", authenticateToken); // All routes under /api will require authentication

app.use("/api/cashflow", cashflowRoute);
