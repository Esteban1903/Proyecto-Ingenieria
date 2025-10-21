document.getElementById("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    password,
    nombreEmpresa: document.getElementById("nombreEmpresa").value,
    sector: document.getElementById("sector").value,
    ingresos: parseFloat(document.getElementById("ingresos").value),
    gastos: parseFloat(document.getElementById("gastos").value),
    deudas: parseFloat(document.getElementById("deudas").value) || 0,
    objetivo: document.getElementById("objetivo").value,
  };

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Registro exitoso");
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      window.location.href = "index.html";
    } else {
      alert(result.error || "Error al registrar el usuario");
    }
  } catch (err) {
    console.error("Error al conectar con el servidor:", err);
    alert("No se pudo conectar con el servidor");
  }
});
