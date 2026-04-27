import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '1111-placeholder.apps.googleusercontent.com');

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
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

export const loginUser = async (userData) => {
  const { email, password } = userData;

  const user = await User.findOne({ email, isDeleted: false }).select('+password');

  if (user && (await user.comparePassword(password))) {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    };
  } else {
    throw new ApiError(401, 'Geçersiz email veya şifre');
  }
};

export const googleLoginUser = async (data) => {
  const { idToken } = data;
  if (!idToken) throw new ApiError(400, 'Google token eksik');

  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID || '1111-placeholder.apps.googleusercontent.com',
  });
  
  const payload = ticket.getPayload();
  if (!payload) throw new ApiError(400, 'Geçersiz Google Tokeni');
  
  const { email, given_name, family_name, sub, picture } = payload;
  
  let user = await User.findOne({ email });
  
  if (user) {
    if (!user.googleId) {
      user.googleId = sub;
      user.avatar = user.avatar || picture;
      await user.save();
    }
  } else {
    user = await User.create({
      email,
      firstName: given_name || 'İsimsiz',
      lastName: family_name || 'Kullanıcı',
      googleId: sub,
      avatar: picture
    });
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};
