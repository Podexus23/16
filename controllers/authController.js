// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    next(new AppError('please provide email and password', 400));
  }

  // 2) check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }

  // 3) if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it's there
  let token;
  req.requestTime = new Date().toISOString();
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check  if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  }
  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password! Please login again', 401),
    );
  }

  // grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles
    if (!roles.includes(req.user.role))
      return next(
        new AppError('you do not have permission to perform this action', 403),
      );
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with email address.', 404));
  }

  //generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //send it to user email

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}. 
  If you didn't forget your password, please ignore this`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. try again later!',
        505,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user base on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // if token has not expired, and there is user, set new password
  if (!user) return next(new AppError('token is invalid or has expired'), 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // update changePasswordAt property for user
  // Log the user in, send JWT

  createSendToken(user, 200, res);
});

exports.updatePassport = catchAsync(async (req, res, next) => {
  //get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));

  //if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user in, send JWT
  createSendToken(user, 200, res);
});
