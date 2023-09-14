import * as userModel from "../models/user_model.js";
import * as eventModel from "../models/event_model.js"
import * as friendModel from "../models/friend_model.js";
import jwt from 'jsonwebtoken';
const SECRET = 'thisismynewproject';
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Taipei");
export const readEvent = async(req,res) =>{
	
	
	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
	const event_id = req.params.id;
	const id = await eventModel.updateReadEvent(myId,event_id);
	
	if(id ===false){
		res.status(400).send(JSON.stringify({"error":"can't read event"}));
		return;
	}

	const resData = {};
	const data = {};
	data['id'] = id["id"];
	resData['event'] = data;
	res.status(200).send(JSON.stringify({"data":resData}));


}

export const getEvent = async(req,res) =>{


        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
        const myId = decoded["id"];
	const events = await eventModel.getEvents(myId);
	let _events = [];

	for(let i =0;i<events.length;i++){
		const _event = {}
		_event["id"] = events[i]["id"];
		_event["type"] = events[i]["type"];

		let read = events[i]["is_read"];
		if(read ==="false"){read = false;}else{read = true;}
		_event["is_read"] = read;

		const taipeiDateTime = moment.utc(events[i]["created_at"]).tz('Asia/Taipei');
		const formattedDate = taipeiDateTime.format('YYYY-MM-DD HH:mm:ss');
		_event["created_at"] = formattedDate;
		_event["summary"] = events[i]["summary"];

		const userDetail = await userModel.getUserDetailById(events[i]["sender"]);
		_event["image"] = userDetail["picture"];
		_events.push(_event);

	}
	res.status(200).send(  JSON.stringify( { "data" :{ "events":JSON.parse(JSON.stringify(_events))}}))



}

