import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { customerRouter } from './routes/customer.routes.js';
import { dealRouter } from './routes/deal.routes.js';
import { productRouter } from './routes/product.routes.js';
import { saleRouter } from './routes/sale.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/customers', customerRouter);
app.use('/api/deals', dealRouter);
app.use('/api/products', productRouter);
app.use('/api/sales', saleRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 CRM Server running at http://localhost:${PORT}`);
});
