import { Link } from "react-router-dom";
import "./Logo.css";

interface Props {
  compact?: boolean;
  showText?: boolean;
}

export function Logo({ compact, showText = true }: Props) {
  return (
    <Link to="/" className={`logo ${compact ? "logo--compact" : ""}`}>
      <img src="/logo.jpg" alt="" className="logo__img" aria-hidden />
      {showText && <span className="logo__text">ReelSaga</span>}
    </Link>
  );
}
