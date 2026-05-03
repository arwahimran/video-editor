const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  genre:       { type: String, default: 'General' },
  status:      { type: String, default: 'In Progress' },
  clipCount:   { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);