const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: String,
  description: String,
  releaseYear: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  personalNote: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can't add the same movie twice
movieSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
