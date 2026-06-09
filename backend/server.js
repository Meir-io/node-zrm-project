
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const noticesRoutes = require("./src/routes/noticesRoutes");
const usersRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const eventsRoutes = require("./src/routes/eventsRoutes");
const { errorHandler } = require("./src/middleware/errorMiddleware");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/events", eventsRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
