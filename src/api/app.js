import express from 'express';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';
import authRoutes from '../routes/authRoutes.js';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const __filename= fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname,'..','..', 'public')));


app.use('/auth', authRoutes);

app.use('/', (req, res) =>{
return res.sendFile(path.join(__dirname,'..','..', 'public','html', 'landingpage.html'));
});

app.listen(port, ()=>{
console.log(`The server is running on: http://localhost:${port}`);
});
