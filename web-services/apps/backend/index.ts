import express from 'express';
import cors from 'cors';
import UserRouter from './routes/user';
import vmInstance from './routes/vmInstance';
import vm from './routes/vm';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/vmInstance", vmInstance);
app.use("/api/v1/vm", vm)

app.listen(3000, () => {
  console.log('Backend server is running on http://localhost:3000');
});