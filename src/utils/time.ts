export const formatLocalTimestamp = (value: Date): string =>
  value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  });
