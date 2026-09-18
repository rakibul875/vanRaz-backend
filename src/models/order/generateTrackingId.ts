export const generateTrackingId = (): string => {
  const prefix = "TRK";
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `${prefix}-${dateStr}-${randomHex}`;
};
