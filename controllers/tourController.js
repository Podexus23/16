const fs = require('fs');

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}\\..\\dev-data\\data\\tours-simple.json`)
);

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

  // if (id > toursData.length) {
  if (!tour) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }

  console.log(req.params);
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
    `${__dirname}\\dev-data\\data\\tours-simple.json`,
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
  if (+req.params.id > toursData.length) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }

  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here>' } });
};

exports.deleteTour = (req, res) => {
  if (+req.params.id > toursData.length) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }

  res.status(204).json({ status: 'success', data: null });
};
