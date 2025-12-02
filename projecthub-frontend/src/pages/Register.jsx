import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("در حال ارسال...");

    try {
      const res = await fetch("http://192.168.56.10:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "خطا رخ داد");
        return;
      }

      setMessage("GREAT , you registerd.");
    } catch (error) {
      setMessage("ارتباط برقرار نشد، انگار سرور قهر کرده.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        /><br/><br/>

        <button type="submit">Register</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Register;
