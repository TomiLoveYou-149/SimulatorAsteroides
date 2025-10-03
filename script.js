const asteroidSelect = document.getElementById("asteroid");
const velocityInput = document.getElementById("velocityInput");
const densityInput = document.getElementById("densityInput");
const simulateBtn = document.getElementById("simulateBtn");

const inputDiameter = document.getElementById("inputDiameter");
const inputVelocity = document.getElementById("inputVelocity");
const inputDensity = document.getElementById("inputDensity");

const impactEnergyEl = document.getElementById("impactEnergy");
const craterDiameterEl = document.getElementById("craterDiameter");
const riskEl = document.getElementById("risk");
const consequenceText = document.getElementById("consequenceText");
const mitigationText = document.getElementById("mitigationText");

const canvas = document.getElementById("viz");
const ctx = canvas.getContext("2d");

const worldMap = new Image();
worldMap.src = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg";

const apiKey = "WN7UDKL6yLacEyLQPw66ewRt4ryJabeE8YAWNPoQ";

let craterX = canvas.width/2;
let craterY = canvas.height/2;
let craterDiameterGlobal = 0;
let isDragging = false;

async function loadAsteroids() {
  try {
    const res = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`);
    const data = await res.json();

    asteroidSelect.innerHTML = '<option value="">--Selecciona un asteroide--</option>';
    window.asteroidMap = {};

    data.near_earth_objects.forEach(a => {
      if(!a.name) return;
      const option = document.createElement("option");
      option.value = a.id;
      option.textContent = a.name;
      asteroidSelect.appendChild(option);
      window.asteroidMap[a.id] = a;
    });

  } catch(err) {
    console.error("Error cargando asteroides:", err);
    asteroidSelect.innerHTML = '<option value="">Error al cargar asteroides</option>';
  }
}

function simulateImpact() {
  const asteroidId = asteroidSelect.value;
  if (!asteroidId) return alert("Selecciona un asteroide.");

  const asteroid = window.asteroidMap[asteroidId];

  const diameter = (asteroid.estimated_diameter.meters.estimated_diameter_min +
                    asteroid.estimated_diameter.meters.estimated_diameter_max) / 2;

  let velocity = Number(velocityInput.value);
  let density = Number(densityInput.value);
  if (isNaN(velocity) || velocity <= 0) velocity = 1;
  if (isNaN(density) || density <= 0) density = 1;

  inputDiameter.textContent = `Diámetro ingresado: ${diameter.toFixed(1)} m (${(diameter/1000).toFixed(2)} km)`;
  inputVelocity.textContent = `Velocidad: ${velocity.toFixed(0)} m/s`;
  inputDensity.textContent = `Densidad: ${density.toFixed(0)} kg/m³`;

  const mass = (4/3) * Math.PI * Math.pow(diameter/2, 3) * density;
  const energy = 0.5 * mass * velocity * velocity;
  const energyMt = energy / 4.184e15;
  const craterDiameter = 1.5 * Math.pow(energy, 0.25);

  craterDiameterGlobal = craterDiameter;

  impactEnergyEl.textContent = `Energía liberada: ${energyMt.toFixed(2)} Mt TNT (Megatón de TNT = un millón de toneladas de dinamita)`;

  craterDiameterEl.textContent = `Diámetro estimado del cráter: ${craterDiameter.toFixed(1)} m (${(craterDiameter/1000).toFixed(2)} km)`;

  let riskLevel = "";
  if (craterDiameter > 5000) riskLevel = "Catastrófico";
  else if (craterDiameter > 1000) riskLevel = "Alto";
  else if (craterDiameter > 100) riskLevel = "Moderado";
  else riskLevel = "Bajo";

  const riskColors = {
    "Bajo":"#b3ffcc",
    "Moderado":"#fff3b3",
    "Alto":"#ffb3b3",
    "Catastrófico":"#ff4d4d"
  };
  riskEl.style.background = riskColors[riskLevel];
  riskEl.textContent = `Nivel de riesgo: ${riskLevel}`;

let consequence = "";
let mitigation = "";

if(riskLevel==="Catastrófico") {
  consequence = `
    <p>Un impacto de esta magnitud tendría efectos devastadores a nivel global. 
    La liberación de energía generaría incendios masivos, tsunamis de alcance continental 
    y una alteración climática severa debido a las partículas proyectadas a la atmósfera. 
    La pérdida de infraestructura crítica sería casi total y la economía mundial colapsaría. 
    Además, el evento podría desencadenar una extinción masiva de especies, incluyendo la posible desaparición de la humanidad.</p>
  `;
  mitigation = `
    <p>Ante un escenario de estas características, las estrategias de mitigación deben 
    ser globales y coordinadas. Se requeriría la desviación o fragmentación del asteroide 
    mediante tecnología espacial avanzada, lo que implica cooperación internacional e inversión 
    a largo plazo. También serían necesarias evacuaciones masivas en zonas vulnerables, 
    protección de infraestructuras críticas, almacenamiento de alimentos y recursos estratégicos, 
    así como la preparación de planes globales de supervivencia a largo plazo.</p>
  `;
} else if (riskLevel==="Alto") {
  consequence = `
    <p>Un impacto de nivel alto causaría daños regionales extremadamente graves. 
    Ciudades enteras podrían ser destruidas, generando millones de víctimas, y los incendios 
    se extenderían rápidamente por grandes áreas. Si el asteroide impactara en el océano, 
    produciría tsunamis capaces de afectar continentes enteros. Los efectos atmosféricos locales 
    provocarían cielos oscurecidos durante semanas o meses, interrumpiendo la agricultura 
    y afectando gravemente la vida cotidiana de millones de personas.</p>
  `;
  mitigation = `
    <p>La mitigación en este caso se centraría en planes de evacuación regionales y 
    en la preparación de la infraestructura médica, logística y de transporte. 
    Sería fundamental el monitoreo constante del objeto y la posibilidad de realizar 
    misiones de desviación antes del impacto. Además, los gobiernos tendrían que coordinar 
    recursos para garantizar refugios, hospitales de campaña, y asegurar el abastecimiento 
    de agua y alimentos en las zonas no afectadas directamente.</p>
  `;
} else if (riskLevel==="Moderado") {
  consequence = `
    <p>En un impacto moderado, los daños serían localizados pero significativos. 
    Una explosión aérea podría generar ondas expansivas capaces de romper ventanas 
    y dañar estructuras débiles en un radio de varios kilómetros. También podrían 
    producirse incendios locales y lesiones en la población cercana, aunque no se 
    trataría de un evento de gran escala. El impacto afectaría principalmente a 
    una región determinada, sin consecuencias globales.</p>
  `;
  mitigation = `
    <p>La mitigación consistiría en activar sistemas de alerta temprana para advertir 
    a la población de la zona afectada. Se podrían realizar evacuaciones puntuales 
    en áreas de mayor riesgo, reforzar infraestructuras vulnerables y preparar a los 
    equipos de emergencia y bomberos. Con una respuesta rápida y organizada, los daños 
    podrían reducirse de manera considerable.</p>
  `;
} else {
  consequence = `
    <p>Un impacto de baja magnitud tendría efectos mínimos y muy localizados. 
    El cráter generado sería relativamente pequeño y las ondas expansivas no 
    llegarían a zonas pobladas más allá del punto de impacto. En la mayoría 
    de los casos, este tipo de eventos se perciben más como un espectáculo 
    natural que como una amenaza real para la civilización.</p>
  `;
  mitigation = `
    <p>En este escenario, solo sería necesario un monitoreo básico y la aplicación 
    de planes de seguridad locales. La población cercana podría ser informada para 
    mantenerse a salvo, pero no se justificaría una movilización de grandes recursos. 
    Lo fundamental sería observar el fenómeno y registrar datos científicos para 
    mejorar la preparación frente a futuros eventos.</p>
  `;
}

consequenceText.innerHTML = consequence;
mitigationText.innerHTML = mitigation;


consequenceText.innerHTML = consequence;
mitigationText.innerHTML = mitigation;




  drawImpact();
}

function drawImpact() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(worldMap,0,0,canvas.width,canvas.height);

  if(craterDiameterGlobal <= 0) return;

  const minPx = 20;
  const maxPx = 400;
  let radius = craterDiameterGlobal / 50;
  radius = Math.max(radius, minPx);
  radius = Math.min(radius, maxPx);

  const gradient = ctx.createRadialGradient(craterX, craterY, 0, craterX, craterY, radius);
  gradient.addColorStop(0,"rgba(255,0,0,0.9)");
  gradient.addColorStop(0.5,"rgba(255,140,0,0.7)");
  gradient.addColorStop(0.8,"rgba(255,255,0,0.5)");
  gradient.addColorStop(1,"rgba(255,255,0,0.2)");

  ctx.beginPath();
  ctx.arc(craterX, craterY, radius, 0, 2*Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.closePath();
}

canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dx = mouseX - craterX;
  const dy = mouseY - craterY;
  const radius = Math.max(craterDiameterGlobal/50, 20);
  if(Math.sqrt(dx*dx + dy*dy) <= radius) isDragging = true;
});

canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mouseleave", () => isDragging = false);
canvas.addEventListener("mousemove", e => {
  if(!isDragging) return;
  const rect = canvas.getBoundingClientRect();
  craterX = e.clientX - rect.left;
  craterY = e.clientY - rect.top;
  drawImpact();
});

simulateBtn.addEventListener("click", simulateImpact);
worldMap.onload = () => loadAsteroids();
