import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

export const registerUser = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'Kullanıcı e-postası sistemde zaten mevcut');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password, 
  });

  return {
    _id: user._id,
    email: user.email,
    token: generateToken(user._id),
  };
};

export const loginUser = async (userData) => {
  const { email, password } = userData;

  const user = await User.findOne({ email, isDeleted: false }).select('+password');

  if (user && (await user.comparePassword(password))) {
    return {
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    };
  } else {
    throw new ApiError(401, 'Geçersiz email veya şifre');
  }
};
