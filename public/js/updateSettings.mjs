/* eslint-disable */
import { showAlerts } from './alerts.mjs';

//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlerts('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlerts('error', err.response.data.message);
  }
};
