const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize the express app
const app = express();

// Middleware configuration
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Seat Schema and Model
const seatSchema = new mongoose.Schema({
  row: { type: Number, required: true },
  number: { type: Number, required: true, unique: true },
  status: {
    type: String,
    enum: ["available", "reserved"],
    default: "available",
  },
});

const Seat = mongoose.model("Seat", seatSchema);

// Initialize seats if none exist in the database
const initializeSeats = async () => {
  try {
    const existingSeats = await Seat.countDocuments();

    if (existingSeats === 0) {
      const seatPromises = Array.from({ length: 80 }, (_, i) => {
        return new Seat({
          row: Math.ceil((i + 1) / 7),
          number: i + 1,
          status: "available",
        }).save();
      });

      await Promise.all(seatPromises);
      console.log("Initialized 80 seats in the database.");
    } else {
      console.log("Seats are already initialized.");
    }
  } catch (error) {
    console.error("Error initializing seats:", error);
    process.exit(1);
  }
};

const findBestAvailableSeats = async (seatsRequired) => {
  try {
    const availableSeats = await Seat.find({ status: "available" }).sort({ row: 1, number: 1 });
    seatsRequired = parseInt(seatsRequired);

    if (isNaN(seatsRequired) || seatsRequired <= 0) {
      throw new Error("Invalid number of seats requested");
    }

    // Group available seats by rows
    const rowMap = availableSeats.reduce((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    // Check for contiguous seats in the same row
    for (const row in rowMap) {
      const seatsInRow = rowMap[row];
      for (let i = 0; i <= seatsInRow.length - seatsRequired; i++) {
        const contiguousSeats = seatsInRow.slice(i, i + seatsRequired);
        if (contiguousSeats.length === seatsRequired) {
          return contiguousSeats;
        }
      }
    }

    // Check for nearby seats across adjacent rows
    const rows = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < rows.length; i++) {
      const currentRow = rows[i];
      const previousRow = rows[i - 1];
      const nextRow = rows[i + 1];

      let nearbySeats = [];
      nearbySeats.push(...(rowMap[currentRow] || []));
      nearbySeats.push(...(rowMap[previousRow] || []));
      nearbySeats.push(...(rowMap[nextRow] || []));

      if (nearbySeats.length >= seatsRequired) {
        return nearbySeats.slice(0, seatsRequired);
      }
    }

    // If not enough seats found, return any combination
    if (availableSeats.length >= seatsRequired) {
      return availableSeats.slice(0, seatsRequired);
    }

    // If no suitable seats are found, return null
    return null;
  } catch (error) {
    console.error("Error finding best available seats:", error);
    throw error;
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Route to reset all seats
app.post("/reset", async (req, res, next) => {
  try {
    await Seat.updateMany({}, { $set: { status: "available" } });
    console.log("All seats reset to available.");
    res.json({
      success: true,
      message: "All seats have been reset to available.",
    });
  } catch (error) {
    next(error);
  }
});

// Route to fetch all seats
app.get("/seats", async (req, res, next) => {
  try {
    const seats = await Seat.find().sort({ row: 1, number: 1 });
    res.json(seats);
  } catch (error) {
    next(error);
  }
});

// Route to reserve seats
app.post("/reserve", async (req, res, next) => {
  const { seatsRequired } = req.body;
  try {
    if (!seatsRequired || seatsRequired < 1 || seatsRequired > 7) {
      return res.status(400).json({
        success: false,
        message: "SeatsRequired must be between 1 and 7",
      });
    }

    const bestAvailableSeats = await findBestAvailableSeats(seatsRequired);
    if (!bestAvailableSeats) {
      return res.status(404).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    const seatUpdatePromises = bestAvailableSeats.map((seat) =>
      Seat.findByIdAndUpdate(seat._id, { status: "reserved" }, { new: true })
    );
    const updatedSeats = await Promise.all(seatUpdatePromises);

    res.json({
      success: true,
      reservedSeats: updatedSeats,
    });
  } catch (error) {
    next(error);
  }
});

// Start the server and initialize seats on startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeSeats();
});

module.exports = app; // Export for testing purposes