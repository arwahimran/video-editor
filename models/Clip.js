const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:      { type: String, default: 'Untitled Clip' },
  videoFile: { type: String, default: null },
  startTime: { type: Number, default: 0 },
  endTime:   { type: Number, default: 0 },
  notes:     { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Clip', clipSchema);