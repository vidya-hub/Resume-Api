var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ProfileImage = Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users_data'
    },
    fileid: { type: Schema.Types.ObjectId, }

});
module.exports = profileImg = mongoose.model('ProfileImageData', ProfileImage);

