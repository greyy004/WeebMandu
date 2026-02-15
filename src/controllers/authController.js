import {prisma} from '../lib/db.js';
import bcrypt from 'bcrypt';

export const authRegister=async (req, res)=>{
const {username, email, password}=req.body;
const hashed_password=await bcrypt.hash(password, 10);
try {
    const user = await prisma.user.create(
        {
            data:{
                name: username, 
                email, 
                password: hashed_password
            },
        }
    );
    if(!user)
    {
        return res.status(409).json({message: "error while creating user"});
    }
    console.log(user);
    return res.status(200).json({data:{username: user.name },message: "user created succesfully"});

}catch(err)
{
    return res.status(400).json({message: err.message});
}
};



export const authLogin= async(req,res)=>{

};