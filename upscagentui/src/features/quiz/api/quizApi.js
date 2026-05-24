import axiosInstance from "../../../shared/axios/axiosInstance";

export const getNextQuestion = () => axiosInstance.get("/next");

export const postAnswer = (answer) => axiosInstance.post("/answer", { answer });
