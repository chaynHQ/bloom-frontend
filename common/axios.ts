import axios, { AxiosError } from 'axios';
import getConfig from 'next/config';
import rollbar from '../config/rollbar';

const { publicRuntimeConfig } = getConfig();

let baseUrl = publicRuntimeConfig.BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api/`,
});

const handleError = (error: AxiosError | Error) => {
  if (axios.isAxiosError(error)) {
    rollbar.error('axios error', error);
  } else {
    rollbar.error('stock error', error);
  }
  throw error;
};

export const axiosGet = async (url: string, options: object) => {
  try {
    const { data } = await axiosInstance.get(url, options);
    return data;
  } catch (error) {
    handleError(<AxiosError | Error>error);
  }
};

export const axiosPatch = async (url: string, newData: object, options: object) => {
  try {
    const { data } = await axiosInstance.patch(url, newData, options);
    return data;
  } catch (error) {
    handleError(<AxiosError | Error>error);
  }
};

export const axiosPut = async (url: string, newData: object, options: object) => {
  try {
    const { data } = await axiosInstance.put(url, newData, options);
    return data;
  } catch (error) {
    handleError(<AxiosError | Error>error);
  }
};

export const axiosDelete = async (url: string, options: object) => {
  try {
    const { data } = await axiosInstance.delete(url, options);
    return data;
  } catch (error) {
    handleError(<AxiosError | Error>error);
  }
};
export default axiosInstance;
