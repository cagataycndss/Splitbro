import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AppError from './utils/AppError.js';

// Route dosyalarını içeri aktar
import groupRoutes from './routes/groupRoutes.js';

// Ortam Değişkenlerini (Env) yükle
dotenv.config();

const app = express();

// Global Middlewares
app.use(cors()); // Farklı URL'lerden gelecek isteklere (CORS) izin ver
app.use(express.json()); // Gelen JSON request body verilerini parse et

// Veritabanı Bağlantısını Kur (Not: Bu aşamada test amaçlı MONGODB_URI eklenmesi gerekir)
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/splitbro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('DB bağlantısı başarılı!'))
  .catch(err => console.log('DB bağlantı hatası:', err));
*/

// --------- ROUTES (BAĞLANTILAR) ---------

// 7 Adet API Endpoints buraya bağlanır
app.use('/api/v1/groups', groupRoutes);

// Tanımlanmamış tüm yollar için 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
});

// Global Hata Yakalama (Error Handling) Middleware
// Throw edilen bütün AppError objeleri burada standart bir JSON olarak döndürülür
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose Validation Error (Geçersiz Veri 400)
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(val => val.message);
    err.message = `Geçersiz Veri: ${errorMessages.join('. ')}`;
    err.statusCode = 400;
    err.status = 'fail';
  }
  
  // Cast Error (Geçersiz ID Formatı 400)
  if (err.name === 'CastError') {
    err.message = `${err.path} alanı için geçersiz ID formatı! (${err.value}).`;
    err.statusCode = 400;
    err.status = 'fail';
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Sunucuyu başlat (Not: Eğer bu projeyi export ediyorsan listener app.listen burada olmalı)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});

export default app;
