const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log('✅ Database Ready!');
  console.log(`🎬 Server running at http://localhost:${PORT}`);
});