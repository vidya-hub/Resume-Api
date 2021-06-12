const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const methodOverRide = require("method-override");
const crypto = require('crypto')


const mongoURI = "mongodb+srv://resumeApp:B5emcpwPuWwiwZB3@resumeapp.xd4fr.mongodb.net/resume_app_db?retryWrites=true&w=majority"
let conn = mongoose.connection
let gfs
conn.once('open', () => {
  //initialize our stream
  gfs = Grid(conn.db, mongoose.mongo)
  gfs.collection('imageUpload')
})
let storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise(
      (resolve, reject) => {
        const fileInfo = {
          // userId: req.id,
          filename: file.originalname,
          bucketName: "imageUpload"
        }
        resolve(fileInfo)

      }
    )
  }
})
var upload = multer({ storage });// var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = upload;
