import type { ReactElement } from "react";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps): ReactElement {
  return <p className="state-message">{message}</p>;
}
