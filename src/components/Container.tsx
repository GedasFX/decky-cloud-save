import { PropsWithChildren } from "react";

export default function Container({ title, children, help }: PropsWithChildren<{ title: string; help?: JSX.Element }>) {
  return (
    <div style={{ margin: "1em", marginTop: "40px", overflow: "scroll", maxHeight: "calc(100% - 1em)" }}>
      <h2 style={{ width: "100%", display: "flex", alignContent: "space-between" }}>
        <span>{title}</span>
        <span style={{ marginLeft: "auto" }}>{help}</span>
      </h2>
      <div>{children}</div>
    </div>
  );
}
