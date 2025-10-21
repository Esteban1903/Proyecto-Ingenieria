document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Inicio de sesión exitoso");
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.location.href = "index.html";
    } else {
      alert(data.error || 'Error al iniciar sesión');
    }

  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    alert('No se pudo conectar con el servidor');
  }
});