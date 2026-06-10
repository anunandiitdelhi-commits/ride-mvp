const dotenv = require("dotenv");
dotenv.config();
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
const mongoose = require("mongoose")
const express = require("express");


const cors = require("cors");


const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const driverRoutes = require("./routes/driverRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const http = require("http");
const { Server } = require("socket.io");
const { setIO } = require("./utils/socket");


mongoose.connect(process.env.MONGO_URI, {
 serverSelectionTimeoutMS:10000,
 family:4
}).then(()=> console.log("MongoDB connected") ).catch(err =>console.log(err));

const app = express();
app.use(cors({origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175","https://ride-mvp-git-main-anunandiitdelhi-commits-projects.vercel.app"], credentials:true}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175","https://ride-mvp-main-anunandiitdelhi-commits-projects.vercel.app"], credentials:true
  }
});

setIO(io);


app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/driver",driverRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/payment",paymentRoutes);

app.get("/", (req, res) => {
  res.send("🚕 Ride MVP Backend Running");
});

io.on("connection", (socket) => {

  console.log("⚡ User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected");
  });
  
socket.on("driverLocationUpdate",(data) => {
  io.emit("driverLocationUpdated", data);
});

socket.on("driverAvailable", (data) => {
  socket.driverId = data.driverId;
  socket.isDriver = true;
  console.log("Driver available:", data.driverId);
});

socket.on("requestRide", (data) => {
  console.log("Ride requested, finding drivers...");
  const availableDrivers = [];
  io.sockets.sockets.forEach((s) => {
    if (s.isDriver) {
      availableDrivers.push(s);
    }
  });
  console.log("Drivers:", availableDrivers.length);
  availableDrivers.forEach((driverSocket) => {
    driverSocket.emit("newRideRequest", data);
  });
});

});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});