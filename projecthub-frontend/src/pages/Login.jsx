import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("در حال ورود...");

    try {
      const res = await fetch("http://192.168.56.10:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "ایمیل یا رمز اشتباه است");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setMessage("ورود موفق! در حال انتقال...");
      setTimeout(() => navigate("/dashboard"), 1000);

    } catch (error) {
      setMessage("ارتباط با سرور برقرار نشد");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>ورود به حساب کاربری</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input
            name="email"
            placeholder="ایمیل"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            name="password"
            placeholder="رمز عبور"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <p style={{ marginTop: "15px", color: "#666" }}>
        حساب ندارید؟ <a href="/register" style={{ color: "#007bff" }}>ثبت‌نام کنید</a>
      </p>

      {message && (
        <p style={{ 
          marginTop: "15px", 
          padding: "10px", 
          background: message.includes("موفق") ? "#d4edda" : "#f8d7da",
          color: message.includes("موفق") ? "#155724" : "#721c24",
          borderRadius: "4px"
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;
