import e from "express";
import UserRoute from "./routes/userRoutes.js";
import contactRoute from "./routes/contactRoutes.js";
import ExpensesRouter from './routes/expenseRoutes.js'
import GroupRoute from "./routes/groupRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";
import cors from "cors";
import connectDB from "./utils/mongo.js";
import cookieParser from 'cookie-parser';
import sendMail from "./utils/resend.js";
const app = e();
const PORT = process.env.PORT;
import "./cronJobs/index.js"; // Import cron jobs to ensure they run on server start

app.use(e.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // Allow cookies to be sent
}));

//routes
app.use("/user",UserRoute);
app.use("/contact",contactRoute);
app.use("/groups", GroupRoute);
app.use("/expenses", ExpensesRouter);
app.use("/dashboard", dashboardRoutes);
app.use("/settlements", settlementRoutes);

//connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
