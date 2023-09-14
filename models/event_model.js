import mysql from 'mysql2'
import pool from './user_model.js';
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()


export async function updateRequestEvent(sender, receiver, name) {
	
	await pool.query( 'INSERT INTO events (sender,receiver,type, summary, is_read, created_at) VALUES (?,?,?,?, ?, NOW())', [ sender,receiver ,"friend_request", `${name} invited you to be friends.`, "false"] );
	
}	
export async function updateFriendEvent(sender,receiver, name) {
	
	await pool.query('INSERT INTO events (sender, receiver, type, summary, is_read, created_at) VALUES (?, ?, ?, ?, ?, DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s"))', [sender, receiver, "friend_request", `${name} has accepted your friend request.`, "false"]);

}

export async function getEvents(myId){

	const [result] = await pool.query('SELECT * FROM events WHERE receiver =? ORDER BY id DESC',[myId]);
	return result;

}

export async function updateReadEvent(myId,eventId){
	
	const [id] = await pool.query('SELECT id FROM events WHERE id = ? ', [eventId]);
        const [receiver] = await pool.query('SELECT receiver FROM events WHERE id = ? ', [eventId]);
	if(id.length===0||receiver.length===0||receiver[0]["receiver"]!==myId){  return false;}
	const [result] = await pool.query(`UPDATE events SET is_read  = ? WHERE id =?`,["true",eventId]);
	return id[0];


}
