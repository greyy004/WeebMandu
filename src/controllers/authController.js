
import bcrypt from 'bcrypt';
import { jwtToken} from '../middlewares/authMiddleware.js'
import pool from '../libs/db.js';

export const authRegister = async (req, res) => {
  const { username, email, password } = req.body;
  const hashed_password = await bcrypt.hash(password, 10);
  try {
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, is_admin AS "isAdmin"
    `;
    const { rows } = await pool.query(query, [username, email, hashed_password]);
    const user = rows[0];

    if (!user) {
      return res.status(409).json({ message: "error while creating user" });
    }
    console.log(user);
    return res.status(200).json({ data: { username: user.name }, message: "user created succesfully" });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};



export const authLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT id, password, is_admin AS "isAdmin", name FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordTrue = await bcrypt.compare(password, user.password);

    if (!passwordTrue) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const userPayload = {
      id: user.id,
      username: user.name,
      isAdmin: user.isAdmin
    }

    const token = jwtToken(userPayload);
    const maxAge = 3 * 24 * 60 * 60;

    res.cookie('jwt', token,{
    httpOnly: true,
    maxAge: maxAge * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.name,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
export const authLogout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
};
