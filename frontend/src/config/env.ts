const DEFAULT_API_BASE_URL = "http://localhost:4200";

type EnvShape = {
  apiBaseUrl: string;
};

const ENV_VAR_MAP: Record<keyof EnvShape, string> = {
  apiBaseUrl: "NEXT_PUBLIC_API_BASE_URL",
};

const envValues: EnvShape = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
};

const ensureValidUrl = (key: keyof EnvShape, value: string) => {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("must use http or https protocol");
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Invalid ${ENV_VAR_MAP[key]} value: ${reason}`);
  }
};

ensureValidUrl("apiBaseUrl", envValues.apiBaseUrl);

export const env = envValues;
