import mysql from 'mysql2'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import * as cache from "../utils/cache.js";

dotenv.config()
const pool = mysql.createPool({
  
	host: process.env.MYSQL_HOST,
  	user: process.env.MYSQL_USER,
  	password: process.env.MYSQL_PASSWORD,
  	database: process.env.MYSQL_DATABASE,
	charset: 'utf8mb4'
	//host: '127.0.0.1',
  	//user: 'root',
  	//password: '',
  	//database: 'canchu'

}).promise()

export async function getDatabases() {
  	const [sign_up] = await pool.query("SELECT * FROM sign_up")
  	const [user] = await pool.query("SELECT * FROM users")
  	return { sign_ups: sign_up, users: user }

}




export async function addUser(name,email ,password) {
  	

	const [result] = await pool.query('SELECT * FROM sign_up WHERE email = ?', [email]);
	const regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

	const isMatch = regex.test(email);
   	
	if (result.length > 0) {
    		// check duplicate email
    		return 403;
   	} else if(!name || !email || !password){ 
                // fields must be entered
		return 4001


        }else if(name.length===0 || email.length===0 || password.length===0){   
		// can't be empty
		return 4002
	

   	}else if(!isMatch){
		// a valid  address
		return 4003

   	}else{
    		// email 不存在，执行插入操作
		password = await bcrypt.hash(password, 8)
		await pool.query('INSERT INTO users (provider, email, name,picture) VALUES (?,?, ? ,?)', ["native", email, name,""]);
    		await pool.query('INSERT INTO sign_up (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    		
		const user = await getUserByEmail(email)
		await pool.query('INSERT INTO user_detail (id,name, picture,introduction,tags) VALUES (?,?,?,?,?)', [user["id"],name,"","",""]);
		// 返回成功消息或其他操作
    		return 200;
	}
}	

export async function passwordComp(inputPassword, hashedPassword){
	const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
	return isMatch;
	
}



export async function getUserByEmail(email) {

	const [rows]= await pool.query(`SELECT * FROM users WHERE email = ? `, [email]);	
	return rows[0];

}
export async function getPasswordByEmail(email){
	const [rows]= await pool.query(`SELECT password FROM sign_up WHERE email = ? `, [email]);
        return rows[0]["password"];

}

export async function  updatePicture(id,path){
	await pool.query(`UPDATE user_detail SET picture = ? WHERE id = ?`,[path,id]);
	await pool.query(`UPDATE users SET picture = ? WHERE id = ?`,[path,id]);
	cache.deleteCache(`profile:${id}`)
}
export async function getUserDetailById(userId){

	const [rows]= await pool.query(`SELECT * FROM user_detail WHERE id = ? `, [userId]);
	return rows[0];





}
export async function updateProfile(id ,name,introduction, tags ){
	if(name !==undefined ){
		await pool.query(`UPDATE user_detail SET name = ? WHERE id = ?`,[name, id]);
		await pool.query(`UPDATE users SET name = ? WHERE id = ?`,[name, id]);
	}	
	if(introduction !==undefined){
		await pool.query(`UPDATE user_detail SET introduction  = ? WHERE id = ?`,[introduction,id]);
	}
	if(tags !==undefined){
		await pool.query(`UPDATE user_detail SET tags = ? WHERE id = ?`,[tags, id]);
	}
	//cache.updateUserDetail(id, name, introduction, tags);  // 用修改的
	cache.deleteCache(`profile:${id}`)//用刪除的
}




export async function searchUsers(myId, keyword){

	const [users] = await pool.query(`SELECT F.friend_id, F.user_id, F.status, F.id AS friendshipId, U.id AS userId, U.name, U.picture  FROM user_detail AS U LEFT OUTER JOIN friendship AS F ON (F.friend_id = U.id AND F.user_id = ?) OR (F.friend_id = ? AND F.user_id = U.id) WHERE U.name LIKE ?`, [myId, myId, `%${keyword}%`]);
	
	const total = []
	for(let i =0;i<users.length;i++){
		const data={}
		data["id"] = users[i]["userId"];
		data["name"] = users[i]["name"];
		data["picture"] = users[i]["picture"];
		
		if(users[i]["friendshipId"]===null){

			 data["friendship"] = null;
		
		}else if(users[i]["status"]==="friend"){
			
			data["friendship"] = {"id":users[i]["friendshipId"],"status":"friend"};

		}else if(users[i]["friend_id"]===myId){

			 data["friendship"] = {"id":users[i]["friendshipId"],"status":"pending"};
		}else{

			 data["friendship"] = {"id":users[i]["friendshipId"],"status":"requested"};

		}


		total.push(data)
	}

	return total;

}




export async function getUserDetail(myId, userId){


	//Cache profile
	const cachedUserDetail = await cache.getDataFromCache(`profile:${userId}`);
	if (cachedUserDetail) {
		
		//Cache friendship
		const cachedFriendship = await cache.getDataFromCache(`friendship:${myId}_${userId}`);
		if (cachedFriendship) {
			
			cachedUserDetail["data"]["user"]["friendship"] = Object.keys(cachedFriendship).length===0?null:cachedFriendship;
			return  cachedUserDetail;
			

		 }


		// The friendship is different for every onev(If cachedFriendship ==null, we only get friendship from the database.)
		const queryFriend = `  SELECT id, friend_id, user_id, status
				       FROM friendship
				       WHERE (user_id =? AND friend_id=?) OR (friend_id=? AND user_id=?)

				    `
		const [friend] = await pool.query(queryFriend, [myId, userId, myId, userId]);
		let friendship = null;
        	if( friend.length>0){
                
			const _status = (friend[0]["user_id"]!==myId && friend[0]["status"]!=="friend")? "pending" : friend[0]["status"];
			friendship =  {
                                "id": friend[0].id,
                                "status": _status
                	}
       		 }
		cachedUserDetail["data"]["user"]["friendship"] = friendship;
		// 300 sec 
		await cache.cache(`friendship:${myId}_${userId}`, friendship===null?{}:friendship, 300);

		return  cachedUserDetail;
 	 }

	//If cachedUserDetail==null
	const Query  = `  SELECT U.id, U.name, U.picture, U.introduction, U.tags, F.user_id,
                          F.id as friendship_id, F.status 
                          FROM user_detail as U 
			  LEFT JOIN friendship AS F
			  ON (U.id = F.user_id AND F.friend_id=?) OR (U.id = F.friend_id AND F.user_id=?) 
                          WHERE U.id = ? 
                        `;
        
	const [userDetail] = await pool.query(Query,[myId,myId, userId ]);
	const [friendCount] = await pool.query(`  SELECT COUNT(*) as friend_count FROM friendship WHERE (user_id = ? OR friend_id = ?) AND status = 'friend'`, [userId, userId]);
	let friendship = null;
	if( userDetail[0]["friendship_id"]!==null){
		const _status = (userDetail[0]["user_id"]!==myId && userDetail[0]["status"]!=="friend")? "pending" : userDetail[0]["status"];
		friendship =  {  
				"id": userDetail[0].friendship_id,
				"status": _status
		}
	}
	const userInfo = {
         	"id": userDetail[0].id,
            	"name": userDetail[0].name,
	    	"picture": userDetail[0].picture,
	    	"friend_count": friendCount[0].friend_count,
	    	"introduction": userDetail[0].introduction,
	    	"tags": userDetail[0].tags,
	    	
		 "friendship": friendship
        };

	await cache.cache(`profile:${userId}`,  { data: { user: userInfo } });
	await cache.cache(`friendship:${myId}_${userId}`,  friendship===null?{}:friendship,300);
	return { data: { user: userInfo } };




}








export default pool;

