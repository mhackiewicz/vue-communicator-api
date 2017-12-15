var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
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
  userName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },

});

module.exports = mongoose.model('Contact', ContactSchema);
