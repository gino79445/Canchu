import express from 'express';
import multer from 'multer';
//import {verifyToken, getdata, signup, signin, getProfile, updateUserPicture, updateUserProfile } from './controller.js';
import * as userController from "../controllers/user_controller.js";
import {verifyToken}  from "../utils/verifyToken.js";


const userRouter = express.Router();
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
    		cb(null, 'uploads/');
  	},
 	filename: function (req, file, cb) {
    		cb(null, file.originalname);
  	}
});
const upload = multer({ storage: storage });
//userRouter.get('/signup', userController.getdata);
userRouter.post('/signup', userController.signup);
userRouter.post('/signin', userController.signin);
userRouter.put('/profile', verifyToken ,userController.updateUserProfile);
userRouter.get('/:id/profile', verifyToken ,userController.getProfile);
userRouter.put('/picture', verifyToken ,upload.single('picture'), userController.updateUserPicture);
userRouter.get('/search', verifyToken, userController.search);



export default userRouter;
