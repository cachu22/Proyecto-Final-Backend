import multer from "multer";
import { __dirname } from "./utils.js";
import { logger } from "./logger.js";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const destinationPath = __dirname + '/Public/uploads';
        logger.info('Destination Path - src/utils/multer.js:', destinationPath);
        callback(null, destinationPath);
    },
    filename: function (req, file, callback) {
        const fileName = `${Date.now()}-${file.originalname}`;
        logger.info('File Name - src/utils/multer.js:', fileName);
        callback(null, fileName);
    }
});

const multerUploader = multer({ storage });

export const multerSingleUploader = multerUploader.single('myfile');