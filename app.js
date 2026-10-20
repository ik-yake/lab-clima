
// ── Selectores del DOM
const selector = document.getElementById('selectorCiudad');
const boton = document.getElementById('btnConsultar');
const resultado = document.getElementById('resultado');
const mensajeError = document.getElementById('mensajeError');

// ── Coordenadas de las ciudades del Perú
const CIUDADES = {
  lima: { lat: -12.04, lon: -77.03, nombre: 'Lima' },
  cusco: { lat: -13.53, lon: -71.97, nombre: 'Cusco' },
  arequipa: { lat: -16.41, lon: -71.54, nombre: 'Arequipa' },
  trujillo: { lat: -8.11, lon: -79.03, nombre: 'Trujillo' },
  piura: { lat: -5.19, lon: -80.63, nombre: 'Piura' },
  iquitos: { lat: -3.75, lon: -73.25, nombre: 'Iquitos' },
  puno: { lat: -15.84, lon: -70.02, nombre: 'Puno' },
  huancayo: { lat: -12.07, lon: -75.21, nombre: 'Huancayo' }
};

// ── URL de Open-Meteo
const URL_BASE = 'https://api.open-meteo.com/v1/forecast';

// ── Función principal para consultar el clima
async function consultarClima() {
  const clave = selector.value;
  const ciudad = CIUDADES[clave];

  ocultarError();

  if (!ciudad) {
    resultado.innerHTML = '';
    mostrarError('Selecciona una ciudad válida.');
    return;
  }

  boton.disabled = true;

  resultado.innerHTML = `
    <p class="cargando" role="status">
      Consultando el clima...
    </p>
  `;

  try {
    // Construir URL usando coordenadas
    const url = `${URL_BASE}?latitude=${ciudad.lat}&longitude=${ciudad.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=America/Lima`;

    // Solicitud HTTP GET
    const response = await fetch(url, {
      cache: 'no-store'
    });

    // Comprobar respuesta
    if (!response.ok) {
      throw new Error(
        `Error al conectar con la API (${response.status})`
      );
    }

    // Convertir respuesta a JSON
    const data = await response.json();

    if (!data.current) {
      throw new Error(
        'La API no devolvió información meteorológica válida.'
      );
    }

    // Mostrar los resultados
    renderizarClima(data, ciudad.nombre);

  } catch (error) {
    resultado.innerHTML = '';
    mostrarError('⚠️ ' + error.message);

  } finally {
    boton.disabled = false;
  }
}

// ── Mostrar errores
function mostrarError(msg) {
  mensajeError.textContent = msg;
  mensajeError.style.display = 'block';
}

// ── Ocultar errores
function ocultarError() {
  mensajeError.textContent = '';
  mensajeError.style.display = 'none';
}

// ── Renderizado dinámico usando template literals
function renderizarClima(data, nombreCiudad) {

  const temperatura = data.current.temperature_2m;
  const humedad = data.current.relative_humidity_2m;
  const viento = data.current.wind_speed_10m;
  const altitud = data.elevation;
  const hora = data.current.time.slice(11, 16);

  const html = `
    <article class="tarjeta-clima">

      <div class="tarjeta-cabecera">
        <div>
          <span class="tarjeta-etiqueta">
            CONDICIONES ACTUALES
          </span>

          <h2>${nombreCiudad}</h2>

          <p class="altitud">
            📍 ${altitud} m.s.n.m.
          </p>
        </div>

        <span class="sol" aria-hidden="true">☀</span>
      </div>

      <p class="temperatura">
        ${temperatura}<span>°C</span>
      </p>

      <p class="subtitulo-temperatura">
        Temperatura actual
      </p>

      <div class="detalles">

        <div class="detalle-item">
          <span class="etiqueta">💧 Humedad</span>
          <span class="valor">${humedad}%</span>
        </div>

        <div class="detalle-item">
          <span class="etiqueta">🍃 Viento</span>
          <span class="valor">${viento} km/h</span>
        </div>

        <div class="detalle-item">
          <span class="etiqueta">🕒 Actualizado</span>
          <span class="valor">${hora} (Perú)</span>
        </div>

      </div>

    </article>
  `;

  resultado.innerHTML = html;
}

boton.addEventListener('click', consultarClima);

setInterval(() => {
  consultarClima();
}, 5 * 60 * 1000);
