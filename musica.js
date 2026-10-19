// Música ambiente: intenta sonar sola y sigue por donde quedó al cambiar de página.
(function () {
  var audio = document.getElementById("musica");
  var boton = document.getElementById("btn-musica");
  var aviso = document.getElementById("aviso-musica");
  if (!audio) return;

  var apagada = false;
  try { apagada = sessionStorage.getItem("musicaOff") === "1"; } catch (e) {}

  audio.volume = 0.5;

  // Si el archivo no está donde debe, avisa en pantalla
  var fuente = audio.querySelector("source");
  function falloArchivo() {
    if (aviso) {
      aviso.textContent = "No se encuentra el archivo audio/ambiente.mp3. Revisá que esté en la carpeta audio y que se llame exactamente así.";
      aviso.hidden = false;
    }
  }
  if (fuente) fuente.addEventListener("error", falloArchivo);
  audio.addEventListener("error", falloArchivo);

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
  audio.addEventListener("play", etiqueta);
  audio.addEventListener("pause", etiqueta);

  var eventos = ["pointerdown", "mousedown", "click", "keydown", "touchstart"];
  function esperarInteraccion() {
    function reintento() {
      eventos.forEach(function (ev) { window.removeEventListener(ev, reintento, true); });
      if (!apagada) audio.play().catch(function () {});
    }
    eventos.forEach(function (ev) { window.addEventListener(ev, reintento, true); });
  }

  // Los navegadores bloquean el sonido automático hasta que la persona interactúa:
  // si lo bloquean, arranca con el primer clic, tecla o toque.
  function iniciar() {
    etiqueta();
    if (apagada) return;
    var p = audio.play();
    if (p && p.catch) p.catch(esperarInteraccion);
  }

  if (boton) {
    boton.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) {
        apagada = false;
        audio.play().catch(falloArchivo);
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
  setInterval(guardar, 500);
  window.addEventListener("pagehide", guardar);

  iniciar();
})();
