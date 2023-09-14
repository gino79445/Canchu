import express from 'express';
import * as postController from "../controllers/post_controller.js";
import {verifyToken}  from "../utils/verifyToken.js";
const postRouter = express.Router();

postRouter.post('/',verifyToken ,postController.createPost);
postRouter.put('/:id',verifyToken ,postController.updatePost);
postRouter.post('/:id/like',verifyToken ,postController.createPostLike);
postRouter.delete('/:id/like',verifyToken ,postController.deletePostLike);
postRouter.post('/:id/comment',verifyToken ,postController.createPostComment);
postRouter.get('/search',verifyToken ,postController.search);
postRouter.get('/:id',verifyToken ,postController.getPostDetail);

export default postRouter;
