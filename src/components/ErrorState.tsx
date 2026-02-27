import type { ReactElement } from "react";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  message,
  onRetry
}: ErrorStateProps): ReactElement {
  return (
    <div className="state-message error">
      <p>Error: {message}</p>
      {onRetry ? (
        <button onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  );
}
