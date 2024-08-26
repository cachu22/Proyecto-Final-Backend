import { Router } from 'express';
import UserController from '../../controllers/users.controller.js';
import passport from 'passport';
import { authenticateToken, adminAuth } from '../../middlewares/Auth.middleware.js';
import { multerMultipleUploader } from '../../utils/multer.js';

const userController = new UserController()

const router = Router();
const {
  getAll,
  getOne, //En este caso, sé que entrega toda la info y se puede ver en publico, solo es para pruebas
  getOneInfo,
  create,
  update,
  deleteData,
  changeUserRole,
  documents
} = new UserController();

router.get('/', authenticateToken, adminAuth, getAll);
router.get('/:uid', getOne);
router.get('/user-info/:uid', getOneInfo);
router.post('/', create);
router.put('/:uid', update);
router.delete('/:uid', deleteData);
router.put('/premium/:uid', authenticateToken, adminAuth, changeUserRole);
router.post('/:uid/documents', multerMultipleUploader, documents);

export default router;