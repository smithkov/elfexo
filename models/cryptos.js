var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
   path: {
     type: String,
     required: true,
     trim: true
   },
   originalname: {
     type: String,
     required: true
   },
   coinName: {
     type: String,
     required: true
   },
   initial: {
     type: String,
     required: false
   },
   sellPrice: {
     type: String,
     required: true
   },
   buyPrice: {
     type: String,
     required: true
   }
});

module.exports = mongoose.model('Crypto', imageSchema);
