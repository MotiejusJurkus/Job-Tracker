const DEFAULT_PORT = 3001;
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";
const MIN_PORT = 1;
const MAX_PORT = 65_535;

type Config = {
  databaseUrl: string;
  frontendOrigin: string;
  port: number;
};

export const getPort = (value: string | undefined): number => {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(
      `PORT must be an integer between ${MIN_PORT} and ${MAX_PORT}`,
    );
  }

  return port;
};

export const getDatabaseUrl = (value: string | undefined): string => {
  if (value === undefined || value.trim() === "") {
    throw new Error("DATABASE_URL is required");
  }

  let databaseUrl: URL;

  try {
    databaseUrl = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL");
  }

  if (
    databaseUrl.protocol !== "postgres:" &&
    databaseUrl.protocol !== "postgresql:"
  ) {
    throw new Error(
      "DATABASE_URL must use the postgres or postgresql protocol",
    );
  }

  return value;
};

export const getFrontendOrigin = (value: string | undefined): string => {
  const candidate = value?.trim() || DEFAULT_FRONTEND_ORIGIN;

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new Error("FRONTEND_ORIGIN must be a valid HTTP origin");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.origin !== candidate ||
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new Error("FRONTEND_ORIGIN must be a valid HTTP origin");
  }

  return url.origin;
};

export const getConfig = (environment: NodeJS.ProcessEnv): Config => ({
  databaseUrl: getDatabaseUrl(environment.DATABASE_URL),
  frontendOrigin: getFrontendOrigin(environment.FRONTEND_ORIGIN),
  port: getPort(environment.PORT),
});
