import { motion } from "framer-motion";
import logo from "../assets/logo.svg";
import "./Avatar.css";

/**
 * The bot avatar (the Kiryat HaTikshuv logo) with three animated states:
 *  - idle:     gentle floating
 *  - thinking: bobbing + pulsing glow ring while the backend works
 *  - typing:   subtle "active" nod while the answer is revealed
 *
 * @param {{ state: "idle" | "thinking" | "typing", size?: number }} props
 */
export default function Avatar({ state = "idle", size = 96 }) {
  const float = {
    idle: { y: [0, -6, 0] },
    thinking: { y: [0, -10, 0] },
    typing: { y: [0, -3, 0] },
  }[state];

  const duration = state === "thinking" ? 1.1 : state === "typing" ? 0.6 : 3.2;

  return (
    <div
      className={`avatar avatar--${state}`}
      style={{ width: size, height: size }}
    >
      <span className="avatar__glow" aria-hidden="true" />
      <motion.img
        src={logo}
        alt="אווטאר קריית התקשוב"
        className="avatar__img"
        animate={float}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </div>
  );
}
