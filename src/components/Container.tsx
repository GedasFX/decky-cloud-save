import { PropsWithChildren } from "react";

export default function Container({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div style={{ margin: "1em", overflow: "scroll", maxHeight: "calc(100% - 1em)" }}>
      <h2 style={{ paddingTop: "0.5em" }}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
