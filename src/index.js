import './config';
import './db';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth';
import posts from './routes/posts';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(cors());

app.use('/login', auth);
app.use('/posts', posts);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

