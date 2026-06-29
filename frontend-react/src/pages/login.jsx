import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone → otp → register
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("passenger");
  const [vehicleType, setVehicleType] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("Enter valid 10 digit number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      setError("Enter 4 digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "driver") {
          navigate("/driver");
        } else {
          navigate("/passenger");
        }
      } else if (data.newUser) {
        setStep("register");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name) {
      setError("Enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body = { name, phone, role };
      if (role === "driver") body.vehicleType = vehicleType;
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "driver") {
          navigate("/driver");
        } else {
          navigate("/passenger");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🛺</div>
          <h1 style={{ color: "#FFD700", fontSize: "28px", fontWeight: "800", margin: 0 }}>AutoGo</h1>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>Kannur's own ride app</p>
        </div>

        {/* STEP 1 - Phone */}
        {step === "phone" && (
          <div>
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
              Enter your mobile number to continue
            </p>
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "16px"
            }}>
              <span style={{
                padding: "14px 16px",
                color: "#FFD700",
                fontWeight: "700",
                fontSize: "15px",
                borderRight: "1px solid rgba(255,255,255,0.1)"
              }}>+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="Phone number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "16px",
                  padding: "14px 16px"
                }}
              />
            </div>
            {error && <p style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#555" : "linear-gradient(135deg, #FFD700, #ff8c00)",
                color: "#000",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Sending..." : "Send OTP →"}
            </button>
          </div>
        )}

        {/* STEP 2 - OTP */}
        {step === "otp" && (
          <div>
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "4px", textAlign: "center" }}>
              OTP sent to
            </p>
            <p style={{ color: "#FFD700", fontSize: "16px", fontWeight: "700", textAlign: "center", marginBottom: "24px" }}>
              +91 {phone}
            </p>
            <input
              type="tel"
              maxLength={4}
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "16px",
                color: "#fff",
                fontSize: "24px",
                textAlign: "center",
                letterSpacing: "12px",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box"
              }}
            />
            {error && <p style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#555" : "linear-gradient(135deg, #FFD700, #ff8c00)",
                color: "#000",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "12px"
              }}
            >
              {loading ? "Verifying..." : "Verify OTP ✓"}
            </button>
            <button
              onClick={() => { setStep("phone"); setError(""); }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "12px",
                color: "#888",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              ← Change number
            </button>
          </div>
        )}

        {/* STEP 3 - Register */}
        {step === "register" && (
          <div>
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
              Welcome! Complete your profile
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box"
              }}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                marginBottom: "12px",
                boxSizing: "border-box"
              }}
            >
              <option value="passenger">🧍 Passenger</option>
              <option value="driver">🛺 Driver</option>
            </select>
            {role === "driver" && (
              <select
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                style={{
                  width: "100%",
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "#fff",
                  fontSize: "15px",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box"
                }}
              >
                <option value="auto">🛺 Auto Rickshaw</option>
                <option value="bike">🏍️ Bike</option>
              </select>
            )}
            {error && <p style={{ color: "#ff6b6b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#555" : "linear-gradient(135deg, #FFD700, #ff8c00)",
                color: "#000",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Setting up..." : "Start Riding 🛺"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}