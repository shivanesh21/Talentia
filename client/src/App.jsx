import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Background3D from "./three/Background3D.jsx";
import Hero from "./sections/Hero.jsx";
import RoleChoice from "./sections/RoleChoice.jsx";
import About from "./sections/About.jsx";
import Events from "./sections/Events.jsx";
import Schedule from "./sections/Schedule.jsx";
import StudentLogin from "./sections/StudentLogin.jsx";
import StudentPortal from "./sections/StudentPortal.jsx";
import AdminLogin from "./sections/AdminLogin.jsx";
import AdminDashboard from "./sections/AdminDashboard.jsx";
import WhatsAppHelp from "./sections/WhatsAppHelp.jsx";
import Contact from "./sections/Contact.jsx";

// Views: home (landing) | student (login → portal) | admin (login → dashboard)
export default function App() {
  const [view, setView] = useState("home");
  const [presetEvents, setPresetEvents] = useState([]);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("talentia_admin_token") || "");
  const [studentToken, setStudentToken] = useState(() => sessionStorage.getItem("talentia_student_token") || "");

  // Event cards dispatch this to jump into the student area with a preselected event.
  useEffect(() => {
    const handler = (e) => {
      setPresetEvents(e.detail ? [e.detail] : []);
      setView("student");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("talentia:select-event", handler);
    return () => window.removeEventListener("talentia:select-event", handler);
  }, []);

  const go = (v) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="noise relative min-h-screen">
      <Background3D />
      <Navbar view={view} onNavigate={go} isAdmin={!!adminToken} isStudent={!!studentToken} />

      {view === "home" && (
        <main>
          <Hero onRegister={() => go("student")} />
          <RoleChoice onSelect={(r) => go(r === "admin" ? "admin" : "student")} />
          <About />
          <Events />
          <Schedule />
          <WhatsAppHelp />
          <Contact />
        </main>
      )}

      {view === "student" && (
        <main>
          {studentToken ? (
            <StudentPortal
              token={studentToken}
              presetEvents={presetEvents}
              onLogout={() => { setStudentToken(""); go("home"); }}
              onBack={() => go("home")}
            />
          ) : (
            <StudentLogin
              presetEvents={presetEvents}
              onBack={() => go("home")}
              onSuccess={(t) => { setStudentToken(t); window.scrollTo({ top: 0 }); }}
            />
          )}
          <WhatsAppHelp />
          <Contact />
        </main>
      )}

      {view === "admin" && (
        <main>
          {adminToken ? (
            <AdminDashboard
              token={adminToken}
              onLogout={() => { setAdminToken(""); go("home"); }}
              onBack={() => go("home")}
            />
          ) : (
            <AdminLogin onBack={() => go("home")} onSuccess={(t) => setAdminToken(t)} />
          )}
        </main>
      )}

      <Footer onNavigate={go} />
    </div>
  );
}
