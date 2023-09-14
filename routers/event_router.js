import express from 'express';
import multer from 'multer';
import * as eventController from "../controllers/event_controller.js";
import {verifyToken}  from "../utils/verifyToken.js";
const eventRouter = express.Router();

eventRouter.get('/',verifyToken ,eventController.getEvent);
eventRouter.post('/:id/read',verifyToken ,eventController.readEvent);

export default eventRouter;
