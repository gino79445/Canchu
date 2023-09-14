import express from 'express';
import multer from 'multer';
import * as friendController from "../controllers/friend_controller.js";
import {verifyToken}  from "../utils/verifyToken.js";
const friendRouter = express.Router();

friendRouter.post('/:id/request',verifyToken ,friendController.friendRequest);
friendRouter.get('/pending',verifyToken ,friendController.friendPending)
friendRouter.post('/:id/agree',verifyToken ,friendController.friendAgree);
friendRouter.delete('/:id',verifyToken ,friendController.friendDelete);
friendRouter.get('/',verifyToken ,friendController.getFriend);


export default friendRouter;
