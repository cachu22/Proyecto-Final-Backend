import multer from 'multer';
import path from 'path';
import { __dirname } from './utils.js'; 
import { logger } from './logger.js';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let folder = '';
        switch (file.fieldname) {
            case 'profileImage':
                folder = 'profiles';
                break;
            case 'productImage':
                folder = 'products';
                break;
            case 'document':
                folder = 'documents';
                break;
            default:
                folder = 'others';
                break;
        }
        const destinationPath = path.join(__dirname, 'Public', 'uploads', folder);
        logger.info(`Destination Path - src/utils/multer.js: ${destinationPath}`);
        callback(null, destinationPath);
    },
    filename: function (req, file, callback) {
        const fileName = `${Date.now()}-${file.originalname}`;
        logger.info(`File Name - src/utils/multer.js: ${fileName}`);
        callback(null, fileName);
    }
});

const multerUploader = multer({ storage });

export const multerSingleUploader = multerUploader.single('myfile');
export const multerMultipleUploader = multerUploader.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 },
    { name: 'document', maxCount: 10 }
]);