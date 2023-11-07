/* eslint-disable */
import { showAlerts } from './alerts.mjs';
// import axios from 'axios';

export async function login(email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlerts('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/logout`,
    });
    if (res.data.status === 'success') {
      location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    showAlerts('error', 'Error logging out! Try again.');
  }
}
