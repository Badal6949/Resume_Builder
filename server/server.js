
import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])
import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRouter.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

//Database connection
await connectDB()

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Server is Running...'));
app.use('/api/users', userRouter)
app.use('/api/resumes',resumeRouter)
app.use('/api/ai', aiRouter)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});