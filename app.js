import express from 'express';
import userRouter from './routers/user_router.js';
import friendRouter from './routers/friend_router.js';
import eventRouter from './routers/event_router.js';
import postRouter from './routers/post_router.js';
import cors from 'cors';
import {rateLimiter}  from "./utils/ratelimiter.js";

const app = express();

app.use(express.json())
app.use(cors());

/*
app.use('/uploads', express.static('./uploads'));
app.use('/api/1.0/users',rateLimiter, userRouter);
app.use('/api/1.0/friends',rateLimiter ,friendRouter);
app.use('/api/1.0/events',rateLimiter ,eventRouter);
app.use('/api/1.0/posts',rateLimiter ,postRouter);
app.use('/',(req,res)=>{res.send("200");});
*/

app.use('/uploads', express.static('./uploads'));
app.use('/api/1.0/users', userRouter);
app.use('/api/1.0/friends' ,friendRouter);
app.use('/api/1.0/events' ,eventRouter);
app.use('/api/1.0/posts' ,postRouter);
app.use('/',(req,res)=>{res.send("200");});
import path from 'path'
/*
app.use('/.well-known', express.static('.well-known'));
app.get('/.well-known/pki-validation/2F7A049835DB1895A47BB7A1454E354B.txt', (req, res) => {
const filePath = '/home/ubuntu/appwork/Campus-Summer-Back-End/students/zih-rong/Canchu/.well-known/pki-validation/2F7A049835DB1895A47BB7A1454E354B.txt'
  	res.sendFile(filePath);
});
*/

app.listen(3000, () => {
  	console.log('Server is running on port 3000')
})


// 其他程式碼...
//export default app來導出app變數，以便其他模組可以引入它
export default app;

