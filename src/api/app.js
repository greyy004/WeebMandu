import express from 'express';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';
import authRoutes from '../routes/authRoutes.js';
import CookieParser from 'cookie-parser';
import userRoutes from '../routes/userRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CookieParser());

const __filename= fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname,'..','..', 'public')));


app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.use('/', (req, res) =>{
return res.sendFile(path.join(__dirname,'..','..', 'public','html', 'landingpage.html'));
});



app.listen(port, ()=>{
console.log(`The server is running on: http://localhost:${port}`);
});
