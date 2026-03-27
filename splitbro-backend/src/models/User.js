import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen isim alanını doldurun!'],
    },
    email: {
      type: String,
      required: [true, 'Lütfen email alanını doldurun!'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Lütfen bir şifre girin!'],
      minlength: 6,
      select: false, // Şifre standart sorgularda getirilmesin
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
