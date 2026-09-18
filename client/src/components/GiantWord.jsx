export default function GiantWord({ word = "TALENTIA", className = "" }) {
  return (
    <div className={`giant-word ${className}`} aria-hidden="true">
      <span>{word}</span>
    </div>
  );
}
