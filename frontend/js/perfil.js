document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    alert("Debes iniciar sesión para acceder al perfil.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("nombreUsuario").textContent = usuario.nombre;
  document.getElementById("emailUsuario").textContent = usuario.email;
  document.getElementById("empresaUsuario").textContent = usuario.nombre_empresa || "Sin empresa registrada";
  document.getElementById("sectorUsuario").textContent = usuario.sector || "No especificado";
  document.getElementById("ingresosUsuario").textContent = "$" + (usuario.ingresos?.toLocaleString() || "0");
  document.getElementById("gastosUsuario").textContent = "$" + (usuario.gastos?.toLocaleString() || "0");
  document.getElementById("deudasUsuario").textContent = "$" + (usuario.deudas?.toLocaleString() || "0");
  document.getElementById("objetivoUsuario").textContent = usuario.objetivo || "No especificado";
  document.getElementById("idUsuario").textContent = "#" + usuario.id;

  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      alert("Sesión cerrada correctamente.");
      window.location.href = "login.html";
    });
  }
});
