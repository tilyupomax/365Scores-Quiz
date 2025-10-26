import type { ApiErrorResponse } from "./types";

import axios, { type AxiosError, type AxiosResponse } from "axios";

import { env } from "@/config";

import { ApiError } from "./errors";

const client = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    throw ApiError.fromAxiosError(error);
  },
);

export const httpClient = client;
