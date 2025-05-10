import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./utils/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Billings from "./pages/Billings";
import Templates from "./pages/Templates";
import ComposeMessages from "./pages/Compose/ComposeMessage";
import { BalanceProvider } from "./context/BalanceContext";
// import Promo from "./pages/PromoCodes/Promo";

export default function App() {
  return (
    <>
      <BalanceProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/templates" element={<Templates/>} />
              <Route path="/compose" element={<ComposeMessages />} />
              <Route path="/billings" element={<Billings />} />
              {/* <Route path="/promo" element= {<Promo/>} /> */}
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </BalanceProvider>
    </>
  );
}