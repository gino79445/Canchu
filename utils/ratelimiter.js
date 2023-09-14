import * as cache from "../utils/cache.js";



export async  function rateLimiter(req, res, next) {

	const ip = req.headers['x-forwarded-for'];
	//console.log(ip)
	const isExceed = await cache.checkRateLimit(ip);
	if(!isExceed){  return res.status(429).send('Too Many Requests'); }
	next();

}
