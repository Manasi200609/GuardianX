const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

const app = express();
 
// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/users', userRoutes);

// test route (IMPORTANT for browser)
app.get('/test', (req, res) => {
  res.send('API is working');
});

const PORT = 5000;

mongoose.connect('mongodb://127.0.0.1:27017/guardianx')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0',() => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
