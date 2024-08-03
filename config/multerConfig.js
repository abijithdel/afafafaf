const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, path.join(__dirname, '../public/uploads/video'));
        } else if (file.fieldname === 'img') {
            cb(null, path.join(__dirname, '../public/uploads/image'));
        } else {
            cb(new Error('Invalid field name'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = { upload };
