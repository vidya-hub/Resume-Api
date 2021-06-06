const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

var storage = new GridFsStorage({
  url: "mongodb+srv://resumeApp:B5emcpwPuWwiwZB3@resumeapp.xd4fr.mongodb.net/resume_app_db?retryWrites=true&w=majority",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];
    console.log(req.body);
    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}--${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "profileImages",
    //   userId:req
      filename: `${Date.now()}-bezkoder-${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;
