import * as friendModel from "../models/friend_model.js";
import * as userModel from "../models/user_model.js";
import * as eventModel from "../models/event_model.js";
import jwt from 'jsonwebtoken';

const SECRET = 'thisismynewproject';


export const friendRequest = async(req, res)=>{

	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
	const userId = req.params.id;
	const myId = decoded["id"]
	const id = await friendModel.friendRequest(myId, userId)
	
	if(id ===false){
		res.status(400).send(JSON.stringify({"error":"can't requsest"}));
		return;
	}
	const user = await userModel.getUserDetailById(myId);	
	await eventModel.updateRequestEvent(myId,userId,user["name"]);


	const resData = {};
	const data = {};
	data['id'] = id;
	resData['friendship'] = data;
	res.status(200).send(JSON.stringify({"data":resData}));



}


export const friendPending = async(req, res)=>{

        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        //const userId = req.params.id;
        const myId = decoded["id"]
        const resData = {};
        const data = {};
        const friends = await friendModel.getPendings(myId);
	let users = [];
	
	for(let i =0;i<friends.length;i++){
		
		const requestId = friends[i]["id"];
		let _status = friends[i]["status"];
		if(_status ==="requested"){_status="pending"}else{continue;}
		const friendId = friends[i]["user_id"];
		const friendShip = {};
		const userDetail = await userModel.getUserDetailById( friendId);
		const user = {};
		friendShip["id"]= requestId ;
		friendShip["status"] = _status;
		user["id"] = friendId;
		user["name"] = userDetail["name"]
		user["picture"] = userDetail["picture"];
		user["friendship"] = friendShip;

		users.push(user);


	}
	res.status(200).send(  JSON.stringify( { "data" :{ "users":JSON.parse(JSON.stringify(users))}}))


}

export const friendAgree = async(req, res)=>{

	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"]	
	const friendId = req.params.id;
	const id = await friendModel.requestToFriend(myId,friendId);

	if(id ===false){
                res.status(400).send(JSON.stringify({"error":"can't agree"}));
                return;
        }
	const receiverId = await friendModel.getReceiverId(id["id"]);
	const user = await userModel.getUserDetailById(myId);
	await eventModel.updateFriendEvent(myId,receiverId["user_id"],user["name"]);
        
	const resData = {};
        const data = {};
        data['id'] = id;
        resData['friendship'] = data;
        res.status(200).send(JSON.stringify({"data":resData}));


}

export const friendDelete = async(req, res)=>{

        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"]
        const friendId = req.params.id;
        const id = await friendModel.deleteFriend(myId,friendId);

	if(id ===false){
                res.status(400).send(JSON.stringify({"error":"can't delete"}));
                return;
        }

        const resData = {};
        const data = {};
        data['id'] = id;
        resData['friendship'] = data;
        res.status(200).send(JSON.stringify({"data":resData}));




}

export const getFriend = async(req, res)=>{

        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"]
        const  friend = await friendModel.getFriend(myId);
	res.status(200).send(friend);


}

