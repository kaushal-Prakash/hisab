import e from "express";
import UserRoute from "./routes/userRoutes.js";
import cors from "cors";
import connectDB from "./utils/mongo.js";
import cookieParser from 'cookie-parser';
const app = e();
const PORT = process.env.PORT;

app.use(e.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // Allow cookies to be sent
}));

//routes
app.use("/user",UserRoute);

//connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});