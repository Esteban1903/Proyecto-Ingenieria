import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
