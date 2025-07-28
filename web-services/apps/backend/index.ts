import express from 'express';
import cors from 'cors';
import UserRouter from './routes/user';
import vmInstance from './routes/vmInstance';
import vm from './routes/vm';
import depinRouter from './routes/depin';
import depinVM from './routes/depinVm';

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v2/user", UserRouter);
app.use("/api/v2/vmInstance", vmInstance);
app.use("/api/v2/vm", vm)
app.use("/api/v2/depin", depinRouter);
app.use("/api/v2/depin/user", depinVM);

app.listen(3000, () => {
  console.log('Backend server is running on http://localhost:3000');
});