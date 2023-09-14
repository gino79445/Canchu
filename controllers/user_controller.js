//import { updateProfile,  getUserDetailById, updatePicture,passwordComp, getUserByEmail, addUser, getDatabases, getPasswordByEmail } from './model.js';
import * as userModel from "../models/user_model.js";
import jwt from 'jsonwebtoken';

const SECRET = 'thisismynewproject';

export const getdata = async(req,res)=>{

	const database = await userModel.getDatabases();
	res.send(database.sign_ups,database.users);


}

export const signup = async (req, res) => {
	const resData = {};
	const err = {};

 	const { name, email, password } = req.body;
	const errN = await userModel.addUser(name, email, password);
 	if (errN === 403) {
 		err['error'] = 'duplicate email';
 	   	res.status(403).send(JSON.stringify(err));
  	}else if (errN === 4001) {
 	   	err['error'] = 'All fields (name, email, password) must be entered.';
 	   	res.status(400).send(JSON.stringify(err));
 	}else if (errN === 4002) {
 	   	err['error'] = 'None of the fields should be empty';
 	   	res.status(400).send(JSON.stringify(err));
 	}else if (errN === 4003) {
 	   	err['error'] = 'The email field must be a valid email address.';
 	   	res.status(400).send(JSON.stringify(err));
 	}else {
 	   	const data = {};
 	   	/*
		userModel.getUserByEmail(email).then((note) => {
 	  		const token = jwt.sign({id: note['id']}, SECRET,{ expiresIn: '1 day' } );
 	   		data['access_token'] = token;
 	   		data['user'] = note;
 	   		resData['data'] = data;
 	   	});
		*/

		const note = await userModel.getUserByEmail(email);
      		const token = jwt.sign({ id: note['id'] }, SECRET, { expiresIn: '1 day' });
     		data['access_token'] = token;
      		data['user'] = note;
      		resData['data'] = data;
 	   	res.status(200).send(JSON.stringify(resData));
 	 }
}

export const signin = async (req, res) => {
	const { provider, email, password } = req.body;
  	const err = {};
  	const checkEmail = await userModel.getUserByEmail(email);
	
  	if(!provider || provider === '' || !password || password === '' || !email || email === '') {
		err['error'] = 'data lost';
  	  	res.status(400).send(JSON.stringify(err));
  	}else if (provider !== 'native' && provider !== 'facebook') {
  	  	err['error'] = 'Wrong provider';
  	  	res.status(403).send(JSON.stringify(err));
  	}else if (checkEmail === undefined) {
  	  	err['error'] = 'User Not Found';
  	  	res.status(403).send(JSON.stringify(err));
  	}else{
  	  	const checkPassword = await userModel.getPasswordByEmail(email);
  	  	if ((await userModel.passwordComp(password, checkPassword)) === false) {
  	    		err['error'] = 'Wrong Password';
  	    		res.status(403).send(JSON.stringify(err));
  		}else {
  	   		const resData = {};
  	    		const data = {};
  	    		const note = await userModel.getUserByEmail(email);
  	    		const token = jwt.sign( {id: note['id']},SECRET,{ expiresIn: '1 day' });
  	    		data['access_token'] = token;
  	    		data['user'] = note;
  	    		resData['data'] = data;
  	    		res.status(200).send(JSON.stringify(resData));
  	  	}
  	}
}

export const  getProfile = async (req, res) => {
 	const userId = req.params.id;
	const token = req.header('Authorization').replace('Bearer ', '');
	const decoded = jwt.verify(token, SECRET);
	const myId = decoded["id"]	
	const resData = {};
	const data = {};
	const userDetail = await  userModel.getUserDetail(myId, userId);
	res.status(200).send(JSON.stringify(userDetail));

};

export const  updateUserPicture = async(req, res) => {
  	const image = req.file;
  	if (!image) {
  		const err = {};
		err['error'] = 'Client Error';
                res.status(400).send(JSON.stringify(err));
  	  	return;
  	}

	const token = req.header('Authorization').replace('Bearer ', '');
	const decoded = jwt.verify(token, SECRET);
	const filepath = image.path;
	const path = `https://18.180.135.37/${filepath}`;
	await userModel.updatePicture(decoded['id'],path);
	const resData = {};
	const data = {};
	data['picture'] = path;
	resData['data'] = data;
	res.status(200).send(JSON.stringify(resData));



}

	



export const updateUserProfile = async(req, res)=>{

	const token = req.header('Authorization').replace('Bearer ', '');
	const decoded = jwt.verify(token, SECRET);
	const { name, introduction, tags } = req.body;
	await userModel.updateProfile(decoded['id'], name,introduction,tags)
	const resData = {};
	const data = {};
	data['user'] = {id:decoded['id']};
	resData['data'] = data;
	res.status(200).send(JSON.stringify(resData));


}


export const search = async (req,res)=>{
	
	const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET);
	const myId = decoded["id"]
	const keyword = req.query.keyword;
	const users = await userModel.searchUsers(myId,keyword );
	res.status(200).send(  JSON.stringify( { "data" :{ "users":JSON.parse(JSON.stringify(users))}}))
	

}




