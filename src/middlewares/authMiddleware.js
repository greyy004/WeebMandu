import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../libs/db.js';

dotenv.config();

const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const validateRegister = async (req, res, next) => {
    const { username, email, password } = req.body;
    const nameRegex = /^[A-Za-z]{2,}$/;
    if (!nameRegex.test(username)) {
        return res.status(400).json({ message: "username is not valid" });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "email is not valid" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "password is not valid" });
    }
    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        const userExists = rows[0];

        if (userExists) {
            return res.status(409).json({ message: "user already exists" });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};


export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    next();
};

export const jwtToken = (userPayload) => {
    const token = jwt.sign(userPayload, process.env.SECRET_KEY);
    return token;
}

export const jwtValidation = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(404).json({ message: "no token" });
    }
    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decode;
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: "error verifying the jwt" });
    }
}

export const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
};