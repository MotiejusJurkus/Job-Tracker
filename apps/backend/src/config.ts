const DEFAULT_PORT = 3001;
const MIN_PORT = 1;
const MAX_PORT = 65_535;

export const getPort = (value: string | undefined): number => {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(`PORT must be an integer between ${MIN_PORT} and ${MAX_PORT}`);
  }

  return port;
};
