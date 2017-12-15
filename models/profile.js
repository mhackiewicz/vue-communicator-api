var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProfileSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  growth: {
    type: String,
    required: true
  }


});

module.exports = mongoose.model('Profile', ProfileSchema);
