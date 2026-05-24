import axiosInstance from "../../../shared/axios/axiosInstance";

const NEXT_URL = import.meta.env.VITE_API_NEXT_URL;
const ANSWER_URL = import.meta.env.VITE_API_ANSWER_URL;

export const getNextQuestion = () => axiosInstance.get(NEXT_URL);

export const postAnswer = (answer) => axiosInstance.post(ANSWER_URL, { answer });
