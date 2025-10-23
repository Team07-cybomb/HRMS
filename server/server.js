const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/employees", require("./routes/employeeRoutes.js"));
app.use("/api/onboarding", require("./routes/onboardingRoutes.js"));
app.use("/api/leaves", require("./routes/leaveRoutes.js"));
app.use("/api/offboarding", require("./routes/offboardingRoutes.js"));
app.use("/api/attendance", require("./routes/attendanceRoutes.js"));
app.use("/api/admin", require("./routes/adminAttendanceRoutes.js"));
app.use("/api/teams", require("./routes/teamRoutes.js"));

app.use("/api/announcements", require("./routes/announcementRoutes.js"));
app.use("/api/notifications", require("./routes/notificationRoutes.js"));
app.use("/api/payroll", require("./routes/payrollRoutes.js"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
