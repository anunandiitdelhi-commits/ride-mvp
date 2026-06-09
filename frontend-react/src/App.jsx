import {BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Passenger from "./pages/Passenger";
import Driver from "./pages/Driver";
import Admin from "./pages/Admin";
import PassengerHistory from "./pages/PassengerHistory";
import DriverHistory from "./pages/DriverHistory";
import Notifications from "./pages/Notifications";
import Receipt from "./pages/Receipt";

//Route guard component
function ProtectedRoute({element, allowedRole}) {
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user) return <Navigate to="/" />;
  if(allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return element;
}

export default function App() {
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route 
      path="/passenger" 
      element={<ProtectedRoute element={<Passenger/>} allowedRole="passenger"/>} />
      <Route 
      path="/driver"
       element={<ProtectedRoute element={<Driver/>} allowedRole="driver"/>} />
      <Route 
      path="/admin"
       element={<ProtectedRoute element={<Admin/>} allowedRole="admin"/>} />
      
      <Route
      path="/passenger-history" element={<PassengerHistory />}/>
      <Route path="/driver-history" element={<DriverHistory />}/>
      <Route
       path="/notifications" element={ <Notifications /> }/>
       <Route path="/receipt" element={<Receipt />} />
      </Routes>
      </BrowserRouter>
  );
}