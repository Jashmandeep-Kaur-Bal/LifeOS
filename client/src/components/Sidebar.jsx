import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "230px",
        background: "#081220",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2>LifeOS</h2>

      <hr />

      <p><Link to="/health">Health</Link></p>

      <p><Link to="/finance">Finance</Link></p>

      <p><Link to="/study">Study</Link></p>

      <p><Link to="/calendar">Calendar</Link></p>

      <p><Link to="/email">Email</Link></p>

      <p><Link to="/shopping">Shopping</Link></p>

      <p><Link to="/travel">Travel</Link></p>
    </div>
  );
}