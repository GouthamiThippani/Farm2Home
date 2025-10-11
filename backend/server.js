const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/farm2home', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Farmer Schema
const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  crops: { type: [String], default: [] }
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', farmerSchema);

// Routes

// Get farmer profile by email
app.get('/api/farmer/:email', async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ email: req.params.email });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update farmer profile
app.post('/api/farmer', async (req, res) => {
  try {
    const { name, email, crops } = req.body;
    let farmer = await Farmer.findOne({ email });
    if (farmer) {
      // Update existing
      farmer.name = name;
      farmer.crops = crops;
      await farmer.save();
    } else {
      // Create new
      farmer = await Farmer.create({ name, email, crops });
    }
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
