
import jwt from 'jsonwebtoken';

const SECRET = 'thisismynewproject';


export const verifyToken = async(req, res,next)=>{
        if (!req.headers.authorization) {
                res.status(401).send({ error: "No Token" });
                return;
         }
        const token = req.header("Authorization").replace("Bearer ", "");
        jwt.verify(token,SECRET , (err, decoded) => {
                if (err) {
        //      console.log(err,decoded)
                        res.status(403).send({ error: "Wrong token" });
                        return;
                }

                next();
        });

}

