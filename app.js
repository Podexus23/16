const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}\\dev-data\\data\\tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursData.length,
    data: { tours: toursData },
  });
};

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
  if (+req.params.id > toursData.length) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }

  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here>' } });
};

const deleteTour = (req, res) => {
  if (+req.params.id > toursData.length) {
    return res.status(400).json({ status: 'fail', message: 'invalid ID' });
  }

  res.status(204).json({ status: 'success', data: null });
};

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
