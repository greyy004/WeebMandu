import { prisma } from "../lib/db.js";

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
        const userExists = await prisma.user.findUnique({
            where: { email: email },
        });
        if (userExists) {
            return res.status(409).json({ message: "user already exists" });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};


export const validateLogin = (req, res, next) => {
    const {email, password}=req.body;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "email is not valid" });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "password is not valid" });
    }
    next();
};

