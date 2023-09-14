import mysql from 'mysql2'
import pool from './user_model.js';
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import * as cache from "../utils/cache.js";

dotenv.config()


export async function friendRequest(myId ,userId ){
	
	const [result1] = await pool.query('SELECT * FROM friendship WHERE user_id = ? AND friend_id = ?', [myId, userId]);
	const [result2] = await pool.query('SELECT * FROM friendship WHERE user_id = ? AND friend_id = ?', [userId, myId]);
	
	if (result1.length>0 ||result2.length>0 || myId==userId) {
		return false; 
	}
	await pool.query('INSERT INTO friendship (user_id, friend_id, status ) VALUES (?,?, ?)', [ myId, userId,"requested"]);
	const [friendShip] = await pool.query('SELECT * FROM friendship WHERE user_id = ? AND friend_id = ?', [myId, userId]);
	//for friend cache
	cache.deleteCache(`friendship:${myId}_${userId}`);	
	cache.deleteCache(`friendship:${userId}_${myId}`);

	return  friendShip[0]["id"];
}


export async function getPendings(myId ){

        const [result] = await pool.query('SELECT * FROM friendship WHERE friend_id = ?', [myId]);
	return  result;
}

export async function requestToFriend(myId, friendship_id){

	
	const [id] = await pool.query('SELECT id ,friend_id, user_id FROM friendship WHERE id = ? AND friend_id = ?', [friendship_id,myId]);
        if(id.length===0){  return false;}
        const [result] = await pool.query(`UPDATE friendship SET status = ? WHERE id =?`,["friend",friendship_id]);
	//for friendcount
	cache.deleteCache(`profile:${id[0]["friend_id"]}`);
	cache.deleteCache(`profile:${id[0]["user_id"]}`);
	//for friend cache
        cache.deleteCache(`friendship:${myId}_${id[0]["user_id"]}`);
        cache.deleteCache(`friendship:${id[0]["user_id"]}_${myId}`);


	return id[0];

	
}


export async function getReceiverId(id ){
        const [result] = await pool.query('SELECT user_id  FROM friendship WHERE id = ?', [id]);
	return  result[0];
}


export async function deleteFriend(myId, friendship_id){

	let id = false;
	
/*	
	//condition 1 : myid userId friend 
	const [id1] = await pool.query('SELECT id, friend_id, user_id FROM friendship WHERE user_id = ? AND id = ?', [myId, friendship_id]);
	const [status1] = await pool.query('SELECT status FROM friendship WHERE user_id = ? AND id = ?', [myId, friendship_id]);
	//condition 2 : userId myId friend 
	const [id2] = await pool.query('SELECT id, friend_id, user_id FROM friendship WHERE id = ? AND friend_id = ?', [friendship_id, myId]);
	const [status2] = await pool.query('SELECT status FROM friendship WHERE id = ? AND friend_id = ?', [friendship_id, myId]);
	//condition 3 : myid userId requested 
	const [id3] = await pool.query('SELECT id, friend_id, user_id FROM friendship WHERE user_id = ? AND id = ?', [myId, friendship_id]);
	const [status3] = await pool.query('SELECT status FROM friendship WHERE user_id = ? AND id = ?', [myId, friendship_id]);
	//condition 4 : userId myId requested 
	const [id4] = await pool.query('SELECT id, friend_id, user_id FROM friendship WHERE friend_id = ? AND id = ?', [myId, friendship_id]);
	const [status4] = await pool.query('SELECT status FROM friendship WHERE friend_id = ? AND id = ?', [myId, friendship_id]);

	if((id1.length!==0 && status1[0]["status"]==="friend")   ||  (id2.length!==0 && status2[0]["status"]==="friend")  
	|| (id3.length!==0 && status3[0]["status"]==="requested"|| (id4.length!==0 && status4[0]["status"]==="requested"))){
		await pool.query('DELETE FROM friendship where id =?', [friendship_id]);
		id = friendship_id

        }
*/



	const [result] = await pool.query('SELECT id, friend_id, user_id FROM friendship WHERE id  = ?', [friendship_id]);
	if(result.length!==0){
		await pool.query('DELETE FROM friendship where id =?', [friendship_id]);
        	id = friendship_id
		//for friendcount
		cache.deleteCache(`profile:${result[0]["friend_id"]}`);
		cache.deleteCache(`profile:${result[0]["user_id"]}`);
		//for friend cache
        	cache.deleteCache(`friendship:${myId}_${result[0]["user_id"]}`);
        	cache.deleteCache(`friendship:${myId}_${result[0]["friend_id"]}`);
        	cache.deleteCache(`friendship:${result[0]["user_id"]}_${myId}`);
        	cache.deleteCache(`friendship:${result[0]["friend_id"]}_${myId}`);
	}



	return id;
}

export async function getFriend(myId) {
    	

	const	getFriendQuery= `  SELECT F.id as friendship_id, F.status, U.id as user_id, U.name as name, U.picture 
            			   FROM friendship as F
				   JOIN user_detail as U ON F.friend_id = U.id
				   WHERE F.user_id = ? AND F.status = 'friend'
				   UNION
       		  	           SELECT F.id as friendship_id, F.status, U.id as user_id, U.name as name, U.picture 
           	                   FROM friendship as F
                	           JOIN user_detail as U ON F.user_id = U.id
                     	 	   WHERE F.friend_id = ? AND F.status = 'friend'		 
			`



	const [friends] = await pool.query(getFriendQuery, [myId, myId]);
        // Extract the friend IDs from the result
        const friendList = friends.map((friend) => {
        	
		return {

			"id": friend["user_id"],
			"name": friend["name"],
			"picture": friend["picture"],
			"friendship": {
				"id": friend["friendship_id"],
				"status": friend["status"]
			}
			


		}
	});


	return {"data": {"users": friendList}};
}

