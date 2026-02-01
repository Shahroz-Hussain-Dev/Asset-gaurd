import { Routes, Route } from "react-router-dom";
// import LoginPage from "./components/loginPage";
// import Dashboard from "./components/dashboard";
// import UserDashboard from "./components/UserDashboard";
// import LotteryFrontpage from "./components/landingpage";
// import ContactUs from "./components/contactUs";
import IPFSDashboard from "./components/UserDashboard";
export default function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<LotteryFrontpage />} />
      <Route path="/loginpage" element={<LoginPage />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/userdashboard" element={<UserDashboard />} /> */}
      <Route path="/dashboard" element={<IPFSDashboard />}/>
    </Routes>
  );
}
