const fs = require('fs');

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}\\..\\dev-data\\data\\tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  if (+req.params.id > toursData.length) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'please add price and name' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: toursData.length,
    data: { tours: toursData },
  });
};

exports.getTour = (req, res) => {
  const id = +req.params.id;
  const tour = toursData.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  const newId = toursData.at(-1).id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  toursData.push(newTour);

  fs.writeFile(
    `${__dirname}\\..\\dev-data\\data\\tours-simple.json`,
    JSON.stringify(toursData),
    (err) => {
      if (err) throw Error(err.message + '💥');
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here>' } });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', data: null });
};
