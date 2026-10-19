// Música ambiente: intenta sonar sola y sigue por donde quedó al cambiar de página.
(function () {
  var audio = document.getElementById("musica");
  var boton = document.getElementById("btn-musica");
  if (!audio) return;

  var apagada = false;
  try { apagada = sessionStorage.getItem("musicaOff") === "1"; } catch (e) {}

  audio.volume = 0.5;

  // Retomar desde el segundo en el que estaba en la página anterior
  audio.addEventListener("loadedmetadata", function () {
    try {
      var t = parseFloat(sessionStorage.getItem("musicaT"));
      if (!isNaN(t) && t < audio.duration) audio.currentTime = t;
    } catch (e) {}
  });

  function etiqueta() {
    if (boton) boton.textContent = (audio.paused ? "Activar música ambiente" : "Silenciar música ambiente");
  }

  // Los navegadores bloquean el sonido automático hasta que la persona interactúa.
  // Si lo bloquean, empieza con el primer clic, tecla o toque.
  function iniciar() {
    if (apagada) { etiqueta(); return; }
    var p = audio.play();
    if (p && p.catch) {
      p.then(etiqueta).catch(function () {
        ["click", "keydown", "touchstart"].forEach(function (ev) {
          window.addEventListener(ev, function reintento() {
            if (!apagada) audio.play().then(etiqueta).catch(function () {});
            ["click", "keydown", "touchstart"].forEach(function (e2) {
              window.removeEventListener(e2, reintento);
            });
          });
        });
        etiqueta();
      });
    }
  }

  if (boton) {
    boton.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) {
        apagada = false;
        audio.play();
      } else {
        apagada = true;
        audio.pause();
      }
      try { sessionStorage.setItem("musicaOff", apagada ? "1" : "0"); } catch (e2) {}
      etiqueta();
    });
  }

  function guardar() {
    try { sessionStorage.setItem("musicaT", String(audio.currentTime)); } catch (e) {}
  }
  setInterval(guardar, 1000);
  window.addEventListener("pagehide", guardar);

  iniciar();
})();
