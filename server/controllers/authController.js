import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await Student.findOne({ email });
  let role = 'student';

  if (!user) {
    user = await Admin.findOne({ email });
    role = 'admin';
  }

  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role,
      token: generateToken(user._id, role),
    };

    if (role === 'student') {
        response.profile = {
            department: user.department,
            year: user.year,
            cgpa: user.cgpa,
            resumeLink: user.resumeLink,
            skills: user.skills,
            isVerified: user.isVerified
        };
    }

    res.json(response);
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const studentExists = await Student.findOne({ email });
  const adminExists = await Admin.findOne({ email });

  if (studentExists || adminExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let user;
  try {
    if (role === 'admin') {
      user = await Admin.create({
        name,
        email,
        password,
      });
    } else {
      user = await Student.create({
        name,
        email,
        password,
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role || 'student',
        token: generateToken(user._id, role || 'student'),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server Error during registration", error: error.message });
  }
});

export { authUser, registerUser };
