const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Register validation rules
exports.registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập họ tên')
    .isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập số điện thoại')
    .matches(/^[0-9]{10}$/).withMessage('Số điện thoại phải có 10 chữ số'),
  
  body('password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// Login validation rules
exports.loginValidation = [
  body('emailOrPhone')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập email hoặc số điện thoại'),
  
  body('password')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
];

// Update details validation rules
exports.updateDetailsValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Họ tên phải có ít nhất 2 ký tự'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Số điện thoại phải có 10 chữ số')
];

// Update password validation rules
exports.updatePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
  
  body('newPassword')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu mới')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

// Email validation
exports.emailValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail()
];

// Password validation
exports.passwordValidation = [
  body('newPassword')
    .notEmpty().withMessage('Vui lòng nhập mật khẩu mới')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];
