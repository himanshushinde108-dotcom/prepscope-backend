const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1,
        fields: 2,
        fieldSize: 100 * 1024
    },
    fileFilter(req, file, callback) {
        if (file.mimetype !== "application/pdf" && !file.originalname.toLowerCase().endsWith(".pdf")) {
            const error = new Error("Only PDF resumes are allowed.");
            error.statusCode = 400;
            return callback(error);
        }
        callback(null, true);
    }
})

module.exports = upload;