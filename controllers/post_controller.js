import * as friendModel from "../models/friend_model.js";
import * as userModel from "../models/user_model.js";
import * as eventModel from "../models/event_model.js";
import * as postModel from "../models/post_model.js";
import jwt from 'jsonwebtoken';

const SECRET = 'thisismynewproject';


export const createPost = async(req,res)=>{

	const{ context} = req.body;
	const token = req.header('Authorization').replace('Bearer ', '');
	const decoded = jwt.verify(token, SECRET);
	const myId = decoded["id"];
	const postId = await  postModel.createPost(myId,context);
	if(postId ===false){ 
		res.status(400).send(JSON.stringify({"error" : "create fails"}));
	}else{
		res.status(200).send({"data":{"post":{"id":postId}}});
	}
}


export const updatePost = async(req,res)=>{

	const{ context} = req.body;
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
	const postId = req.params.id;
	const success = await postModel.updatePost(myId,postId,context );
	if(success ===false){
		res.status(400).send(JSON.stringify({"error" : "update fails"}));
	}else{
		res.status(200).send({"data":{"post":{"id":postId}}});
		


	}


}
export const createPostLike =async (req,res)=>{


        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
        const postId = req.params.id;
	const success = await postModel.createLike(myId,postId);
	if(success===false){
		res.status(400).send(JSON.stringify({"error" : "like fails"}));
	}else{
		res.status(200).send({"data":{"post":{"id":postId}}});

	}
}

export const deletePostLike = async(req, res)=>{

        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"]
        const postId = req.params.id;
        const success = await postModel.deleteLike(myId,postId);

	if(success ===false){
                res.status(400).send(JSON.stringify({"error":"can't delete"}));
                return;
        }else{
		res.status(200).send({"data":{"post":{"id":postId}}});

	}





}
export const createPostComment = async(req,res)=>{

        const{ content} = req.body;
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
	const postId = req.params.id
        const commentId = await  postModel.createComment(myId,postId,content);
        if(commentId ===false){
                res.status(400).send(JSON.stringify({"error" : "create fails"}));
        }else{
                
		res.status(200).send({"data":{"post":{"id":parseInt(postId)},"comment":{"id":commentId}}});
        }
}


export const getPostDetail = async(req,res)=>{

	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
        const postId = req.params.id
	const success = await postModel.getPost(myId,postId);

	if(success ===false){
                res.status(400).send(JSON.stringify({"error":"can't get"}));
                return;
        }else{
                res.status(200).send(success);

        }
}



export const search = async(req,res)=>{
	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
	const userId  = req.query.user_id;
	const cursor = req.query.cursor;
	let post;
	if(cursor !== undefined){
		
		const decodedString = Buffer.from(cursor, "base64").toString();

		if(isNaN( parseInt(decodedString))){

			res.status(400).send(JSON.stringify({"error":"can't search"}));
	                return;

		}
		post = await  postModel.searchPost(myId, userId, parseInt(decodedString));

	}else{

		post = await postModel.searchPost(myId, userId, undefined);


	}

		
	if(post ===false){
                res.status(400).send(JSON.stringify({"error":"can't search"}));
                return;
        }else{
                res.status(200).send(post);

        }






}
