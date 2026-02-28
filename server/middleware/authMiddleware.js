import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else {
        req.user = await Student.findById(decoded.id).select('-password');
      }

      if (!req.user) {
          console.log('Auth Middleware: User not found in DB');
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.log('Auth Middleware: No token provided');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('Admin Middleware: User is not admin', req.user ? req.user.role : 'No User');
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
