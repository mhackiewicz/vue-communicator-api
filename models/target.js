var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }


});

module.exports = mongoose.model('Target', TargetSchema);
