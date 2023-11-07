/* disable-eslint */
const stripe = Stripe(
  'pk_test_51O9mQsBEAhZiKODHynd1Ohr9o914KF7Oa2ditUcM0ejY09QBEdGX8GxXb9NR5sBLLy2pDcxYXRIvvR5n64QJiliJ00nCMhgNWb',
);

export const bookTour = async (tourId) => {
  // get checkout session from endpoint API
  const session = await axios(
    `httt://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
  );
  // create checkout form + chare credit card
};
