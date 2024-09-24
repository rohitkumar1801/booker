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
      for (let i = 1; i <= 80; i++) {
        const seat = new Seat({
          row: Math.ceil(i / 7), // Calculate row (7 seats per row)
          number: i,
          status: "available",
        });
        await seat.save();
      }

      console.log("Initialized 80 seats in the database.");
    } else {
      console.log("Seats are already initialized.");
    }
  } catch (error) {
    console.error("Error initializing seats:", error);
  }
};

const findBestAvailableSeats = async (seatsRequired) => {
  try {
    const availableSeats = await Seat.find({ status: "available" });
    seatsRequired = parseInt(seatsRequired);

    // Sort available seats by row and seat number
    availableSeats.sort((a, b) => a.row - b.row || a.number - b.number);

    // Step 1: Group available seats by rows
    const rowMap = {};
    availableSeats.forEach(seat => {
      if (!rowMap[seat.row]) {
        rowMap[seat.row] = [];
      }
      rowMap[seat.row].push(seat);
    });

    // Step 2: Check for contiguous seats in the same row first
    for (const row in rowMap) {
      const seatsInRow = rowMap[row];
      for (let i = 0; i <= seatsInRow.length - seatsRequired; i++) {
        // Check if contiguous seats are available
        const contiguousSeats = seatsInRow.slice(i, i + seatsRequired);
        if (contiguousSeats.length === seatsRequired) {
          return contiguousSeats;
        }
      }
    }

    // Step 3: Check for nearby seats across adjacent rows
    for (const row in rowMap) {
      const seatsInRow = rowMap[row];

      // Check the current row
      for (let i = 0; i < seatsInRow.length; i++) {
        let nearbySeats = [seatsInRow[i]];

        // Try to add nearby seats from the same row
        for (let j = i + 1; j < seatsInRow.length && nearbySeats.length < seatsRequired; j++) {
          nearbySeats.push(seatsInRow[j]);
        }

        // Check the previous row
        const previousRowSeats = rowMap[row - 1] || [];
        for (let j = 0; j < previousRowSeats.length && nearbySeats.length < seatsRequired; j++) {
          nearbySeats.push(previousRowSeats[j]);
        }

        // Check the next row
        const nextRowSeats = rowMap[parseInt(row) + 1] || [];
        for (let j = 0; j < nextRowSeats.length && nearbySeats.length < seatsRequired; j++) {
          nearbySeats.push(nextRowSeats[j]);
        }

        // If we have enough nearby seats
        if (nearbySeats.length >= seatsRequired) {
          return nearbySeats.slice(0, seatsRequired);
        }
      }
    }

    // Step 4: If not enough seats found, return any combination
    if (availableSeats.length >= seatsRequired) {
      return availableSeats.slice(0, seatsRequired);
    }

    // If no suitable seats are found, return null
    return null;
  } catch (error) {
    console.error("Error finding best available seats:", error);
    return null;
  }
};





app.post("/reset", async (req, res) => {
  try {
    // Update all seats to set their status to 'available'
    await Seat.updateMany({}, { $set: { status: "available" } });
    console.log("All seats reset to available.");

    res.json({
      success: true,
      message: "All seats have been reset to available.",
    });
  } catch (error) {
    console.error("Error resetting seats:", error);
    res.status(500).json({ success: false, message: "Failed to reset seats." });
  }
});

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

    // Find the best available seats
    const bestAvailableSeats = await findBestAvailableSeats(seatsRequired);
    if (!bestAvailableSeats) {
      return res.status(404).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    // Reserve the seats by updating their status to 'reserved'
    const seatUpdatePromises = bestAvailableSeats.map((seat) => {
      seat.status = "reserved";
      return seat.save();
    });
    await Promise.all(seatUpdatePromises);

    res.json({
      success: true,
      reservedSeats: bestAvailableSeats,
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
