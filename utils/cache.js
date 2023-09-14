import redis from "redis";
//const redis = require('redis');
import util from 'util';
import pool from '../models/user_model.js';
//const client = redis.createClient();
const client = redis.createClient({
	socket: {  
		host: 'canchu-redis',
  		port: '6379'
	}
});

client.connect();


export async function getDataFromCache(key) {
 
	const cached = await client.get(key);
	if (cached) {
    		
		// console.log('data fetched from cache.');
		return JSON.parse(cached);
  	}
	return null;
}

export async function deleteCache(key) {
        
	await client.del(key);
	// console.log('Delete cache.');

}


export async function cache(keyword, data, sec=3600) {
	
	await client.set(keyword, JSON.stringify(data));
	client.expire(keyword, sec);
	// console.log('Cache.');

}

export async function checkRateLimit(ip) {
	const key = `rate_limit:${ip}`;
	const tokens = await client.get(key);
	if (tokens === null) {
		// If the key doesn't exist, initialize the bucket
		const times = 10;
		const seconds = 1;
		await client.set(key, times);
	    	await client.expire(key,seconds); // Set expiration time
    		return true;
  	}

  	// If tokens are available, process the request and update the bucket
	 if (tokens > 0) {
	    	await client.decr(key);
	    	return true;
	 }

	// No tokens left, rate limit exceeded
  	return false;
}



export async function updateUserDetail(userId, name, introduction, tags ) {
	
	const cachedUser =JSON.parse( await client.get(`profile:${userId}`));
	
	if(cachedUser){

		cachedUser["name"] = name;
		cachedUser["introduction"] = introduction;
		cachedUser["tags"] = tags;
		await client.set(`profile:${userId}`, JSON.stringify(cachedUser));
                console.log('User detail with modified name stored in cache.');
	}


}


	




