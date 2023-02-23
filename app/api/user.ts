import axios from "axios";
import { API_URL } from "~/constants/env";

export const getAllActiveUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/authen/getAllActiveUsers`);

    return response.data;
  } catch (error) {}
};
