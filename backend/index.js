// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize the express app
const app = express();

// Middleware configuration
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://rohitbgmi7q:KDjl8kQIt7B9bZUj@cluster0.lxb1fhm.mongodb.net/trainbook?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Seat Schema and Model
const seatSchema = new mongoose.Schema({
  row: Number, // Row number in the train coach
  number: Number, // Seat number within the coach
  status: {
    // Seat status: available or reserved
    type: String,
    default: "available",
  },
});

const Seat = mongoose.model("Seat", seatSchema);

// Initialize seats if none exist in the database
const initializeSeats = async () => {
  try {
    const existingSeats = await Seat.find();
    if (existingSeats.length === 0) {
      const seatPromises = [];
      for (let i = 1; i <= 80; i++) {
        seatPromises.push(
          new Seat({
            row: Math.ceil(i / 7), // Calculate row (7 seats per row)
            number: i,
            status: "available",
          }).save()
        );
      }
      await Promise.all(seatPromises); // Save all seats concurrently
      console.log("Initialized 80 seats in the database.");
    } else {
      console.log("Seats are already initialized.");
    }
  } catch (error) {
    console.error("Error initializing seats:", error);
  }
};

// Route to fetch all seats
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find(); // Fetch all seats from the database
    res.json(seats);
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch seats" });
  }
});

// Route to reserve seats
app.post("/reserve", async (req, res) => {
  const { seatsRequired } = req.body;

  try {
    // Validate seat request (1-7 seats allowed)
    if (seatsRequired < 1 || seatsRequired > 7) {
      return res.status(400).json({
        success: false,
        message: "SeatsRequired must be between 1 and 7",
      });
    }

    // Find available seats that match the request
    const availableSeats = await Seat.find({ status: "available" }).limit(
      seatsRequired
    );

    // If not enough seats are available
    if (availableSeats.length < seatsRequired) {
      return res.status(400).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    // Reserve seats by updating their status to 'reserved'
    const seatUpdatePromises = availableSeats.map((seat) => {
      seat.status = "reserved";
      return seat.save();
    });

    await Promise.all(seatUpdatePromises); // Save seat updates concurrently

    res.json({
      success: true,
      reservedSeats: availableSeats, // Return the reserved seats
    });
  } catch (error) {
    console.error("Error reserving seats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reserve seats" });
  }
});

// Start the server and initialize seats on startup
app.listen(5000, async () => {
  console.log("Server is running on port 5000");
  await initializeSeats(); // Initialize seats when server starts
});
