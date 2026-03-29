import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', routes); 

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

export default app;
