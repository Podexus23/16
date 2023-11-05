/* eslint-disable */
import { showAlerts } from './alerts.mjs';

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlerts('success', 'Data updated successfully');
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};
