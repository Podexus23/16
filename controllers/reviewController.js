const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, req, next) => {
  const reviews = await Review.find();

  resizeBy.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, req, next) => {
  const newReview = await Review.create(req.bidy);

  resizeBy.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
