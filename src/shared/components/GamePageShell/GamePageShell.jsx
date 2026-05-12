import "./GamePageShell.css";

export default function GamePageShell({ children, className = "" }) {
  const classNames = ["game-page-shell", className].filter(Boolean).join(" ");

  return <main className={classNames}>{children}</main>;
}
