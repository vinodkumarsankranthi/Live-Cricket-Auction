import axios from 'axios';
import { baseURL } from "../../http";

// Fetch all users (admin only)
export const getAllUsers = () => {
  return axios.get(`${baseURL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export const updateUserPlan = (userId, newPlan) => {
  return axios.put(`${baseURL}/admin/users/${userId}/update-plan`, { plan: newPlan }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};
