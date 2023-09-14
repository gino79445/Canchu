import mockedRedis from './redis_mock.js' ;
import pool from '../models/user_model.js';
jest.mock('redis', () => mockedRedis); // 使用模擬的版本替換 redis 模塊

const { signup, signin } = require('../controllers/user_controller.js');

const generateRandomString = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let randomString = '';
        for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                randomString += characters[randomIndex];
        }
        return randomString;
};
   

describe('signup function', () => {
	
	test('correct, should return 200', async () => {

      	      const expectedResponse = {
	     	 	
		      "data": {
		        	"access_token": expect.any(String),
				"user": {
					"email": expect.any(String),
					"id": expect.any(Number),
					"name": expect.any(String),
					"picture": expect.any(String),
					"provider": expect.any(String),
				},
	      		},
	    	};

		const email =`${generateRandomString(10)}@gmail.com`;
		const password = generateRandomString(10);
		const name = generateRandomString(10);
		
		const req = { "body": { "email": email, "name": name, "password" : password } };
		const res = {status: jest.fn(() => res),send: jest.fn() };
		await signup(req, res);
		expect(res.status).toHaveBeenCalledWith(200);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual(expectedResponse);

	});

	test('duplicate email, should return 403', async () => {

		const email =`${generateRandomString(10)}@gmail.com`;
		const password = generateRandomString(10);
		const name = generateRandomString(10);
                
		let req = { "body": { "email": email, "name": name, "password": password } };
                let res = {status: jest.fn(() => res),send: jest.fn() };
               	await signup(req, res); 
                req = { "body": { "email": email, "name": name, "password": password } };
                res = {status: jest.fn(() => res),send: jest.fn() };
		await signup(req, res);
		expect(res.status).toHaveBeenCalledWith(403);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });

	test('lose one field, should return 400', async () => {

		const password = generateRandomString(10);
		const name = generateRandomString(10);

                let req = {"body": { "name": name, "password": password } };
                let res = {status: jest.fn(() => res),send: jest.fn() };
                await signup(req, res);
                expect(res.status).toHaveBeenCalledWith(400);
                const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });


        });

	test('the format of the email error, should return 400', async () => {

		const email =`${generateRandomString(10)}gmail.com`;
		const password = generateRandomString(10);
                const name = generateRandomString(10);
                
		let req = { "body": { "email": email, "name": name, "password": password } };
		let res = {status: jest.fn(() => res),send: jest.fn() };
                await signup(req, res);
                expect(res.status).toHaveBeenCalledWith(400);
                const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });


        });

});



describe('signin function', () => {
	
		const email =`${generateRandomString(10)}@gmail.com`;
		const password = generateRandomString(10);
                const name = generateRandomString(10);
	
	test('correct, should return 200', async () => {

		let req = { "body": { "email": email, "name": name, "password": password } };
                let res = {status: jest.fn(() => res),send: jest.fn() };
                await signup(req, res);
                let response = JSON.parse(res.send.mock.calls[0][0]);
		const user = response["data"]["user"];
               	
	
                req = { "body" : { "email": email, "provider": 'native', "password": password } };
                res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
                response = JSON.parse(res.send.mock.calls[0][0]);
        	const expectedResponse = {
			"data": {
                                "access_token": expect.any(String),
                                "user": user
                        }
                };
		
		expect(response).toEqual(expectedResponse);

        });

	test('password error, should return 403', async () => {

                const req = { "body" : { "email": email, "provider": 'native', "password": "error" } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(403);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });
	
	test('email error, should return 403', async () => {

                const req = { "body" : { "email": "error", "provider": 'native', "password": password } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(403);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });

	test('provider error, should return 403', async () => {

                const req = { "body" : { "email": email, "provider": 'error', "password": password } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(403);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });
	
	test('email miss, should return 400', async () => {

                const req = { "body" : {  "provider": 'native', "password": password } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });

	test('password miss, should return 400', async () => {

                const req = { "body" : { "email": email, "provider": 'native' } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });
	
	test('provider miss, should return 400', async () => {

                const req = { "body" : { "email": email, "password": password } };
                const res = {status: jest.fn(() => res),send: jest.fn() };
                await signin(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		const response = JSON.parse(res.send.mock.calls[0][0]);
                expect(response).toEqual({ error: expect.any(String) });

        });



});

afterAll(async () => {
  await pool.end();
});

