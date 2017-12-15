var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DialogSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  contactId: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  lp: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: false
  },
  fileContent: {
    type: String,
    required: false
  } 


});

module.exports = mongoose.model('Dialog', DialogSchema);
