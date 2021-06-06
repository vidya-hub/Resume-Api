var mongoose = require('mongoose');

var ProfileImage = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users_data'
    },
    img:{ data: Buffer, contentType: String }

});
var ProfileImages = module.exports = mongoose.model('ProfileImageData', ProfileImage);

