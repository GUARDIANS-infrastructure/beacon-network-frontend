import { type ReactElement, useState } from "react";

type JsonPanelProps = {
  title: string;
  value: unknown;
};

export function JsonPanel({ title, value }: JsonPanelProps): ReactElement {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const serialized = JSON.stringify(value, null, 2);

  const onCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(serialized);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="json-panel">
      <div className="json-panel-header">
        <h3>{title}</h3>
        <div>
          <button onClick={() => setExpanded((prev) => !prev)} type="button">
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button onClick={() => void onCopy()} type="button">
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>
      {expanded ? <pre>{serialized}</pre> : null}
    </section>
  );
}
