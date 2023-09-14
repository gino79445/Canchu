import mysql from 'mysql2'
import pool from './user_model.js';
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import * as cache from "../utils/cache.js";
dotenv.config()
import moment from "moment-timezone"; 
moment.tz.setDefault("Asia/Taipei");

export async function createPost(myId, context){

  	const [result] =await pool.query( `INSERT INTO post_detail (created_at, context, is_liked, like_count, comment_count, user_id) VALUES (NOW(), ?, 0, 0, 0, ?)`, [context, myId] );
	return result["insertId"];

}

export async function updatePost(myId , postId,context){
	const 	[result] = await pool.query(`UPDATE post_detail SET context  = ? WHERE id = ? AND user_id = ?`,[context,postId,myId]);
	if(result.affectedRows==0){return false;}
	return true;


}
 
export async function createLike(myId, postId){

	//const 	[result] = await pool.query(`UPDATE likes SET context  = ? WHERE id = ? AND user_id = ?`,[context,postId,myId]);
	const [result] = await pool.query('SELECT * FROM post_detail  WHERE id = ?', [ postId]);
	const [liked] = await pool.query('SELECT * FROM likes  WHERE post_id = ? AND user_id = ?', [ postId, myId]);
	if(result.length===0||liked.length>0){return false;}
	await pool.query( `INSERT INTO likes (post_id, user_id ) VALUES ( ?, ?)`, [postId, myId] );
	//cache.deleteCache(`like_count:${postId}`);
	//cache.deleteCache(`is_liked:${myId}_${postId}`);
	return true;



}



export async function deleteLike(myId , postId){

       
        const [result] = await pool.query('DELETE FROM likes where post_id =? AND user_id = ?', [postId, myId]);
	if(result.affectedRows==0){return false;}
	//cache.deleteCache(`like_count:${postId}`);
        //cache.deleteCache(`is_liked:${myId}_${postId}`);
	return true;



}
export async function createComment(myId , postId , content){

	

	const [result] = await pool.query('SELECT * FROM post_detail  WHERE id = ?', [ postId]);
        if(result.length===0){return false;}
	const result1 = await pool.query( `INSERT INTO comments (created_at, content, user_id, post_id) VALUES (NOW(), ?, ?, ?)`, [content, myId,postId] );
	//cache.deleteCache(`comment_count:${postId}`);
	return result1["insertId"];

}
export async function getPost(myId,postId){
	


	//---------------------------BETTER WAY-------------------------------
	const getPostQuery = `  SELECT P.user_id,P.id, P.created_at, P.context, U.name, U.Picture AS picture
				FROM post_detail AS P
     				LEFT JOIN user_detail AS U ON P.user_id =  U.id 
      				WHERE P.id = ? 
				
				`
	const [postDetail] = await pool.query(getPostQuery, [postId]);


	if (postDetail.length ===0) {return false;}

    	const getLikeQuery = `SELECT user_id FROM likes WHERE post_id = ? `;
    	const [like] = await pool.query(getLikeQuery, [postId]);
    	const like_count = like.length;

    	const checkIsLike = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
    	const [is_like] = await pool.query(checkIsLike, [postId, myId]);
	let is_liked = false;
	if(is_like.length >0){ is_liked = true;}


	const getCommentQuery = `  SELECT C.id, C.created_at, C.content, U.id AS user_id, U.name, U.picture
				   FROM comments AS C
				   INNER JOIN user_detail AS U ON C.user_id = U.id
				   WHERE C.post_id = ?
				`
	const [commentDetail] = await pool.query(getCommentQuery, [postId])
	const comment_count = commentDetail.length;
	
	const date = new Date(postDetail[0]["created_at"]);
        const formattedDate = date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
	

	const post = {
      		"id": postDetail[0]["id"],
      		"created_at": formattedDate,
      		"context": postDetail[0]["context"],
      		"is_liked": is_liked,
      		"like_count": like_count,
      		"comment_count": comment_count,
      		"picture": postDetail[0]["picture"],
      		"name": postDetail[0]["name"],
		"user_id": postDetail[0]["user_id"],
      		"comments": commentDetail.map( row => {
        		

			const date = new Date(row["created_at"]);
        		const formattedDate = date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
			return {
          	
				"id": row["id"],
          			"created_at": formattedDate,
          			"content": row["content"],
          			"user": {
            				"id": row["user_id"],
            				"name": row["name"],
            				"picture": row["picture"],
          			}
        		};
      		})
    	};


//  	await cachePost(postId, post);
	return  {"data": {"post": post }};



}

export async function searchPost(myId, userId, cursor){

	

	const userQuery = `SELECT * FROM user_detail WHERE id = ?`;
        const [user] = await pool.query(userQuery, [userId]);
        if(userId!==undefined && user.length===0){ return false;}
	
	let searchPostQuery;
	let post;

	if(userId===undefined && cursor===undefined){
	

		searchPostQuery = `  SELECT P.id, P.user_id, P.created_at, P.context, U.picture, U.name, F.user_id AS sender, F.friend_id AS reciever
                                     FROM post_detail AS P
                                     LEFT JOIN user_detail AS U ON P.user_id =  U.id
                                     LEFT JOIN friendship AS F ON F.status = 'friend' AND( (F.user_id = P.user_id AND  F.friend_id = ?) OR (F.friend_id = P.user_id AND F.user_id = ?))
                                     WHERE  P.user_id =? OR( F.user_id IS NOT NULL AND F.friend_id IS NOT NULL)
				     ORDER BY P.id DESC
                                     LIMIT 30;

                                  `;

		[post] = await pool.query(searchPostQuery, [ myId, myId, myId]);


	}else if(userId===undefined){

		searchPostQuery = `  SELECT P.id, P.user_id, P.created_at, P.context, U.picture, U.name
                                     FROM post_detail AS P
                                     LEFT JOIN user_detail AS U ON P.user_id =  U.id
				     LEFT JOIN friendship AS F ON F.status = 'friend' AND( (F.user_id = P.user_id AND  F.friend_id = ?) OR (F.friend_id = P.user_id AND F.user_id = ?))
				     WHERE P.id <= ?  AND ( P.user_id = ? OR (F.user_id IS NOT NULL AND F.friend_id IS NOT NULL)) 
				     ORDER BY P.id DESC
                                     LIMIT 11;

                                  `;
                [post] = await pool.query(searchPostQuery, [ myId, myId, cursor, myId ]);
	}else if(cursor===undefined){

		searchPostQuery = `  SELECT P.id, P.user_id, P.created_at, P.context, U.picture, U.name
                                     FROM post_detail AS P
                                     LEFT JOIN user_detail AS U ON P.user_id =  U.id
                                     WHERE  U.id = ?
                                     ORDER BY P.id DESC
                                     LIMIT 11;

                                  `;
                [post] = await pool.query(searchPostQuery, [userId]);

	}else{
		
		searchPostQuery = `  SELECT P.id, P.user_id, P.created_at, P.context, U.picture, U.name
                                     FROM post_detail AS P
                                     LEFT JOIN user_detail AS U ON P.user_id =  U.id
                                     WHERE P.id <= ? AND U.id = ? 
                                     ORDER BY P.id DESC
                                     LIMIT 11;

                                  `;
                [post] = await pool.query(searchPostQuery,[ cursor ,userId]);


	}

        let nextCursor = null;
	// 判斷是否有下一頁
	if (post.length === 11) {
		
		nextCursor = post[10].id.toString();    
                nextCursor = Buffer.from(nextCursor).toString("base64");
		post.splice(10, 1);


	}





	const posts = {"posts": await Promise.all( post.map(async row => {

				//const date = new Date(row["created_at"]);
				//const formattedDate = date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
				const taipeiDateTime = moment.utc(row["created_at"]).tz('Asia/Taipei');
				const formattedDate = taipeiDateTime.format('YYYY-MM-DD HH:mm:ss');	


				const getLikeQuery = `SELECT user_id FROM likes WHERE post_id = ? `;
				const [like] = await pool.query(getLikeQuery, [row["id"]]);
				const like_count = like.length;

				const checkIsLike = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
				const [is_like] = await pool.query(checkIsLike, [row["id"], myId]);
				let is_liked = false;
				if(is_like.length >0){ is_liked = true;}


				const getCommentQuery = `SELECT * FROM comments WHERE post_id = ? `
				const [comment] = await pool.query(getCommentQuery,[row["id"]]);
				const comment_count = comment.length;
				
				//await cache.cache(`is_liked:${myId}_${row["id"]}`,is_liked);
				//await cache.cache(`comment_count:${row["id"]}`,comment_count);
				//await cache.cache(`like_count:${row["id"]}`,like_count);
				//await cache.cache(`context:${row["id"]}`,);
				return {

					"id": row["id"],
					"user_id": row["user_id"],
					"created_at": formattedDate,
					"context": row["context"],
					"is_liked": is_liked,
					"like_count": like_count,
					"comment_count": comment_count,
					"picture": row["picture"],
					"name": row["name"]

				};
               		})),
			"next_cursor" : nextCursor
		}
	
//        await cache.cache(`post:${userId}_${cursor}`,   {"data": posts})
	return  {"data": posts};


}



export async function cachePost( cursor={}){


//----------------------uncompleted-----------------------------------		
	const cachedPost = await cache.getDataFromCache(`post:${userId}_${cursor}`)
	if(cachedPost){
		
		for(let i=0;i<cachedPost["data"]["posts"].length;i++){
			let like_count = await cache.getDataFromCache(`like_count:${cachedPost["data"]["posts"][i]["id"]}`);
			let comment_count = await cache.getDataFromCache(`comment_count:${cachedPost["data"]["posts"][i]["id"]}`);
			let is_liked = await cache.getDataFromCache(`is_liked:${myId}_${cachedPost["data"]["posts"][i]["id"]}`);
		

			if (like_count===null){
				
				const getLikeQuery = `SELECT user_id FROM likes WHERE post_id = ? `;
				const [like] = await pool.query(getLikeQuery, [cachedPost["data"]["posts"][i]["id"]]);
				like_count = like.length;

			}
			if (comment_count===null) {
					    
				const getCommentQuery = `SELECT * FROM comments WHERE post_id = ? `
				const [comment] = await pool.query(getCommentQuery,[cachedPost["data"]["posts"][i]["id"]]);
				comment_count = comment.length;
			}
			if (is_liked===null) {
				
								
				const checkIsLike = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
				const [is_like] = await pool.query(checkIsLike, [cachedPost["data"]["posts"][i]["id"], myId]);
				is_liked = false;
				if(is_like.length >0){ is_liked = true;}
			
			}
			
		
			console.log(like_count, comment_count, is_liked)
			cachedPost["data"]["posts"][i]["is_liked"] = is_liked;
			cachedPost["data"]["posts"][i]["like_count"] = like_count;
			cachedPost["data"]["posts"][i]["comment_count"] = comment_count;
		}

		return cachedPost;




	}



}
