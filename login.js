document.getElementById("formLogin").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("loginError");

  // Credenciales quemadas para la demostración / exposición
  const USER_ADMISION = "admin";
  const PASS_ADMISION = "admision123";

  if (usuario === USER_ADMISION && password === PASS_ADMISION) {
    errorMsg.hidden = true;
    
    // Guardamos en sessionStorage que el usuario está logueado
    sessionStorage.setItem("isLogged", "true");
    
    // Redirigimos al panel de admisión que armamos antes
    window.location.href = "admision.html"; 
  } else {
    errorMsg.hidden = false;
  }
});