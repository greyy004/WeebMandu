import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use('/', (req, res) =>{
return res.status(200).send('hi');
});

app.listen(port, ()=>{
console.log(`The server is running on: http://localhost:${port}`);
});
