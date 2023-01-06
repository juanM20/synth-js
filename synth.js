import createNoteTable from "./noteTable.js";

let audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;
let gateGain = null;
let analyzer = null;

const keyboard = document.querySelector(".keyboard");
const wavePicker = document.querySelector("select[name='waveform']");
const graphPicker = document.querySelector("select[name='graphic-select']");
const volumeControl = document.querySelector("input[name='volume']");
const envelopeControl = document.getElementById("hideEnvelope");
const activeControl = document.getElementById("activeEnvelope");
const customWaveButton = document.getElementById('custom-wave-button');
const sinInput = document.getElementById('sin-input');
const cosInput = document.getElementById('cos-input');

const MAX_TIME = 2;
const ADSR = { attack: 0.2, decay: 0, sustain: 1, release: 0.3 };

let noteFreq = null;
let customWaveform = null;
let sineTerms = null;
let cosineTerms = null;

if (!Object.entries) {
	Object.entries = function entries(O) {
		return reduce(keys(O), (e, k) => concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []), []);
	};
}

const setup = () => {

	/* Inicializar frecuencias para cada nota del teclado */
	noteFreq = createNoteTable();
	/* Inicializar contexto de web audio api */
	mainGainNode = audioContext.createGain();

	volumeControl.addEventListener("change", changeVolume, false);

	/* Inicializar Analizador Visual */
	analyzer = audioContext.createAnalyser();
	analyzer.fftSize = 1024;

	/* Conectar el el nodo principal de ganancia a la salida de audio */
	mainGainNode.connect(analyzer);
	analyzer.connect(audioContext.destination);
	mainGainNode.gain.value = volumeControl.value;

	/* Crear cada 'tecla' en el DOM */
	noteFreq.forEach((keys, idx) => {
		const keyList = Object.entries(keys);
		const octaveElem = document.createElement("div");
		octaveElem.className = "octave";

		keyList.forEach((key) => {
			if (key[0].length === 1) {
				octaveElem.appendChild(createKey(key[0], idx, key[1], 'key'));
			}
			else if (key[0].length === 2) {
				octaveElem.appendChild(createKey(key[0], idx, key[1], 'keyN'));
			}
		});

		keyboard.appendChild(octaveElem);
	});

	document.querySelector("div[data-note='B'][data-octave='5']").scrollIntoView(false);

	sineTerms = new Float32Array([0, 0, 1, 0, 1]);
	cosineTerms = new Float32Array(sineTerms.length);
	customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);

	for (let i = 0; i < 9; i++) {
		oscList[i] = {};
	}
}

const createKey = (note, octave, freq, tipoKey) => {
	const keyElement = document.createElement("div");
	const labelElement = document.createElement("div");

	keyElement.className = tipoKey;//"key";
	keyElement.dataset["octave"] = octave;
	keyElement.dataset["note"] = note;
	keyElement.dataset["frequency"] = freq;

	labelElement.innerHTML = `${note}<sub>${octave}</sub>`;
	keyElement.appendChild(labelElement);

	keyElement.addEventListener("mousedown", notePressed, false);
	keyElement.addEventListener("mouseup", noteReleased, false);
	keyElement.addEventListener("mouseover", notePressed, false);
	keyElement.addEventListener("mouseleave", noteReleased, false);

	return keyElement;
}
const beginPathTime = (ctx) => {

	ctx.fillText("105db", 0, 64);
	ctx.fillText("70db", 0, 128);
	ctx.fillText("35db", 0, 192);
	ctx.beginPath();
	//empieza con eje x
	ctx.moveTo(0, 75);
	ctx.lineTo(1750, 75);
	ctx.moveTo(0, 150);
	ctx.lineTo(1750, 150);
	ctx.moveTo(0, 225);
	ctx.lineTo(1750, 225);
	// empezamos con y
	ctx.moveTo(70, 290);
	ctx.lineTo(70, 0);
	ctx.moveTo(140, 290);
	ctx.lineTo(140, 0);
	ctx.moveTo(210, 290);
	ctx.lineTo(210, 0);
	ctx.moveTo(280, 290);
	ctx.lineTo(280, 0);
	ctx.moveTo(350, 290);
	ctx.lineTo(350, 0);
	ctx.moveTo(420, 290);
	ctx.lineTo(420, 0);
	ctx.moveTo(490, 290);
	ctx.lineTo(490, 0);
	ctx.moveTo(560, 290);
	ctx.lineTo(560, 0);
	ctx.moveTo(630, 290);
	ctx.lineTo(630, 0);
	ctx.moveTo(700, 290);
	ctx.lineTo(700, 0);
	ctx.moveTo(770, 290);
	ctx.lineTo(770, 0);
	ctx.moveTo(840, 290);
	ctx.lineTo(840, 0);
	ctx.moveTo(910, 290);
	ctx.lineTo(910, 0);
	ctx.moveTo(980, 290);
	ctx.lineTo(980, 0);
	ctx.moveTo(1050, 290);
	ctx.lineTo(1050, 0);
	ctx.moveTo(1120, 290);
	ctx.lineTo(1120, 0);
	ctx.moveTo(1190, 290);
	ctx.lineTo(1190, 0);
	ctx.moveTo(1260, 290);
	ctx.lineTo(1260, 0);
	ctx.moveTo(1330, 290);
	ctx.lineTo(1330, 0);
	ctx.moveTo(1400, 290);
	ctx.lineTo(1400, 0);
	ctx.moveTo(1470, 290);
	ctx.lineTo(1470, 0);
	ctx.moveTo(1540, 290);
	ctx.lineTo(1540, 0);
	ctx.moveTo(1610, 290);
	ctx.lineTo(1610, 0);
	ctx.moveTo(1680, 290);
	ctx.lineTo(1680, 0);

	ctx.stroke();
	ctx.closePath();
}

const beginPathFreq = (ctx) => {

	ctx.fillText("140 db", 0, 10);
	ctx.fillText("105 db", 0, 64);
	ctx.fillText("70 db", 0, 128);
	ctx.fillText("35 db", 0, 192);
	// ctx.fillText("25 Hz", 336, 10);
	// ctx.fillText("50 Hz", 672, 10);
	// ctx.fillText("7 Hz", 1008, 10);
	ctx.beginPath();
	//empieza con eje x
	ctx.moveTo(0, 75);
	ctx.lineTo(1344, 75);
	ctx.moveTo(0, 150);
	ctx.lineTo(1344, 150);
	ctx.moveTo(0, 225);
	ctx.lineTo(1344, 225);
	// empezamos con y
	ctx.moveTo(70, 290);
	ctx.lineTo(70, 0);
	ctx.moveTo(95, 290);
	ctx.lineTo(95, 0);
	ctx.moveTo(125, 290);
	ctx.lineTo(125, 0);
	ctx.moveTo(155, 290);
	ctx.lineTo(155, 0);
	ctx.moveTo(185, 290);
	ctx.lineTo(185, 0);
	ctx.moveTo(220, 290);
	ctx.lineTo(220, 0);
	ctx.moveTo(250, 290);
	ctx.lineTo(250, 0);
	ctx.moveTo(280, 290);
	ctx.lineTo(280, 0);
	ctx.moveTo(310, 290);
	ctx.lineTo(310, 0);
	ctx.moveTo(340, 290);
	ctx.lineTo(340, 0);
	ctx.moveTo(370, 290);
	ctx.lineTo(370, 0);
	ctx.moveTo(400, 290);
	ctx.lineTo(400, 0);
	ctx.moveTo(430, 290);
	ctx.lineTo(430, 0);
	ctx.moveTo(460, 290);
	ctx.lineTo(460, 0);
	ctx.moveTo(495, 290);
	ctx.lineTo(495, 0);
	ctx.moveTo(525, 290);
	ctx.lineTo(525, 0);
	ctx.moveTo(555, 290);
	ctx.lineTo(555, 0);
	ctx.moveTo(585, 290);
	ctx.lineTo(585, 0);
	ctx.moveTo(615, 290);
	ctx.lineTo(615, 0);
	ctx.moveTo(645, 290);
	ctx.lineTo(645, 0);
	ctx.moveTo(680, 290);
	ctx.lineTo(680, 0);
	ctx.moveTo(710, 290);
	ctx.lineTo(710, 0);
	ctx.moveTo(740, 290);
	ctx.lineTo(740, 0);
	ctx.moveTo(770, 290);
	ctx.lineTo(770, 0);
	ctx.moveTo(800, 290);
	ctx.lineTo(800, 0);
	ctx.moveTo(830, 290);
	ctx.lineTo(830, 0);
	ctx.moveTo(860, 290);
	ctx.lineTo(860, 0);
	ctx.moveTo(890, 290);
	ctx.lineTo(890, 0);
	ctx.moveTo(920, 290);
	ctx.lineTo(920, 0);
	ctx.moveTo(955, 290);
	ctx.lineTo(955, 0);
	ctx.moveTo(985, 290);
	ctx.lineTo(985, 0);
	ctx.moveTo(1015, 290);
	ctx.lineTo(1015, 0);
	ctx.moveTo(1045, 290);
	ctx.lineTo(1045, 0);
	ctx.moveTo(1075, 290);
	ctx.lineTo(1075, 0);
	ctx.moveTo(1105, 290);
	ctx.lineTo(1105, 0);
	ctx.moveTo(1135, 290);
	ctx.lineTo(1135, 0);
	ctx.moveTo(1170, 290);
	ctx.lineTo(1170, 0);
	ctx.moveTo(1200, 290);
	ctx.lineTo(1200, 0);
	ctx.moveTo(1230, 290);
	ctx.lineTo(1230, 0);
	ctx.moveTo(1260, 290);
	ctx.lineTo(1260, 0);

	ctx.stroke();
	ctx.closePath();
}

const visualize = () => {
	//Ajustes del canvas
	var canvas = document.querySelector('#canvas');
	var ctd = canvas.getContext('2d');
	var ancho = document.getElementById('visualizer').offsetWidth - 80;
	canvas.width = ancho;
	canvas.height = 256;
	ctd.fillStyle = "#dcdcdc";
	ctd.font = "14px Helvetica";
	ctd.clearRect(0, 0, canvas.width, canvas.height);

	beginPathTime(ctd);

	var muestras = new Uint8Array(analyzer.frequencyBinCount);
	analyzer.getByteTimeDomainData(muestras);

	for (var i = 0; i < muestras.length; i++) {
		var valor = muestras[i];
		var porcentaje = valor / 256;
		var alto = canvas.height * porcentaje;
		var offset = canvas.height - alto;
		var trazo = canvas.width / muestras.length;
		ctd.fillRect(i * trazo, offset, 5, 5);
		ctd.moveTo(0, 128);
		ctd.lineTo(ancho, 128);
		ctd.stroke();

	}
	requestAnimationFrame(visualize);
}

const visualizeFrequencies = () => {
	//Ajustes del canvas
	var canvas = document.querySelector('#canvas');
	var ctd = canvas.getContext('2d');
	var ancho = document.getElementById('visualizer').offsetWidth - 80;
	canvas.width = ancho;
	canvas.height = 256;
	var muestras = new Uint8Array(analyzer.frequencyBinCount);
	analyzer.getByteFrequencyData(muestras);

	ctd.fillStyle = "#dcdcdc";
	ctd.font = "14px Helvetica";
	ctd.clearRect(0, 0, canvas.width, canvas.height);

	beginPathFreq(ctd);

	for (var i = 0; i < muestras.length; i++) {
		var bar_x = i * 3;
		var bar_width = 2;
		var bar_height = -(muestras[i] * mainGainNode.gain.value);
		ctd.fillRect(bar_x + 50, canvas.height, bar_width, bar_height);
	}
	requestAnimationFrame(visualizeFrequencies);
}

const clearCanvas = () => {
	var canvas = document.querySelector('#canvas');
	var ctd = canvas.getContext('2d');
	ctd.clearRect(0, 0, canvas.width, canvas.height);
}

const playTone = (freq) => {

	const osc = audioContext.createOscillator();
	gateGain = audioContext.createGain();
	gateGain.gain.value = 0;
	osc.connect(gateGain);
	gateGain.connect(mainGainNode);

	const now = audioContext.currentTime;
	const atkDuration = ADSR.attack * MAX_TIME;
	const atkEndTime = now + atkDuration;
	const decayDuration = ADSR.decay + MAX_TIME;

	gateGain.gain.cancelScheduledValues(audioContext.currentTime);
	gateGain.gain.setValueAtTime(0, audioContext.currentTime);
	gateGain.gain.linearRampToValueAtTime(1, atkEndTime);
	gateGain.gain.setTargetAtTime(ADSR.sustain, atkEndTime, decayDuration);

	const type = wavePicker.options[wavePicker.selectedIndex].value;
	const graph = graphPicker.options[graphPicker.selectedIndex].value;

	type === "custom" ? osc.setPeriodicWave(customWaveform) : osc.type = type;

	osc.frequency.value = freq;
	osc.start();

	graph === 'time' ?
		requestAnimationFrame(visualize) :
		requestAnimationFrame(visualizeFrequencies);

	return osc;
}

const notePressed = (event) => {
	if (event.buttons & 1) {
		const dataset = event.target.dataset;

		if (!dataset["pressed"]) {
			const octave = Number(dataset["octave"]);
			oscList[octave][dataset["note"]] = playTone(dataset["frequency"]);
			dataset["pressed"] = "yes";
		}
	}
}

const playToneOff = (osc) => {
	gateGain.gain.cancelScheduledValues(audioContext.currentTime);
	const now = audioContext.currentTime;
	const relDuration = ADSR.release * MAX_TIME;
	const relEndTime = now + relDuration;
	gateGain.gain.setValueAtTime(gateGain.gain.value, now);
	gateGain.gain.linearRampToValueAtTime(0, relEndTime);
	setTimeout(() => {
		osc.disconnect();
	}, 10000);
}

const noteReleased = (event) => {
	const dataset = event.target.dataset;
	if (dataset && dataset["pressed"]) {
		const octave = Number(dataset["octave"]);
		playToneOff(oscList[octave][dataset["note"]]);
		delete oscList[octave][dataset["note"]];
		delete dataset["pressed"];
		clearCanvas();
	}
}

const changeVolume = (event) => {
	mainGainNode.gain.value = volumeControl.value;
}

/* Iniciar ambiente de Web Audio API  */
setup();

envelopeControl.addEventListener('click', (e) => {
	console.log('envelope saved: ', salidaADSR);
	ADSR.attack = salidaADSR[0];
	ADSR.decay = salidaADSR[1];
	ADSR.sustain = salidaADSR[2];
	ADSR.release = salidaADSR[3];
	cv.style.display = 'none';
	envelopeControl.style.display = 'none';
});

activeControl.addEventListener('click', (e) => {

	if (cv.style.display == 'block') {
		cv.style.display = 'none';
		envelopeControl.style.display = 'none';
	} else {
		cv.style.display = 'block';
		envelopeControl.style.display = 'block';
	}


});

// attackInput.addEventListener('change', e => {
// 	ADSR.attack = e.target.value;
// });

// decayInput.addEventListener('change', e => {
// 	ADSR.decay = e.target.value;
// });

// sustainInput.addEventListener('change', e => {
// 	ADSR.sustain = e.target.value;
// });

// releaseInput.addEventListener('change', e => {
// 	ADSR.release = e.target.value;
// });

customWaveButton.addEventListener('click', e => {
	const args1 = sinInput.value.split(',');
	const args2 = cosInput.value.split(',');
	let sin = [];
	let cos = [];

	if (args1 == '0') {
		cos = new Float32Array(args2);
		sin = new Float32Array(args2.length);
	} else if (args2 == '0') {
		sin = new Float32Array(args1);
		cos = new Float32Array(args1.length);
	} else if (args1 == '0' && args2 == '0') {
		sin = new Float32Array(args1);
		cos = new Float32Array(args2);
	}
	customWaveform = audioContext.createPeriodicWave(cos, sin);
});


/* -------------------  Envolvente --------------------*/

var cv, ctx, nodeIndex, x, y, altura, ancho, salidaADSR;
cv = document.getElementById('lienzo');

ctx = cv.getContext('2d');
nodeIndex = null;
altura = 300;
ancho = 700;

var poligono = [
	[10, 290],
	[70, 75],
	[140, 150],
	[350, 150],
	[420, 290]
];
function dibujaPoligono(poli) {
	var i, x, y;
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, 700, 300);
	ctx.strokeStyle = 'black'; //linea 
	ctx.fillStyle = "black"; //punto
	ctx.lineWidth = 1;
	ctx.fillText("75%", 0, 75);
	ctx.fillText("50%", 0, 150);
	ctx.fillText("25%", 0, 225);
	ctx.fillText("25%", 175, 290);
	ctx.fillText("50%", 350, 290);
	ctx.fillText("75%", 525, 290);
	ctx.beginPath();
	//empieza con eje x
	ctx.moveTo(0, 75);
	ctx.lineTo(700, 75);
	ctx.moveTo(0, 150);
	ctx.lineTo(700, 150);
	ctx.moveTo(0, 225);
	ctx.lineTo(700, 225);
	// empezamos con y
	ctx.moveTo(70, 290);
	ctx.lineTo(70, 0);
	ctx.moveTo(140, 290);
	ctx.lineTo(140, 0);
	ctx.moveTo(210, 290);
	ctx.lineTo(210, 0);
	ctx.moveTo(280, 290);
	ctx.lineTo(280, 0);
	ctx.moveTo(350, 290);
	ctx.lineTo(350, 0);
	ctx.moveTo(420, 290);
	ctx.lineTo(420, 0);
	ctx.moveTo(490, 290);
	ctx.lineTo(490, 0);
	ctx.moveTo(560, 290);
	ctx.lineTo(560, 0);
	ctx.moveTo(630, 290);
	ctx.lineTo(630, 0);


	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.strokeStyle = 'red'; //linea

	for (i = 0; i < poli.length; i++) {
		x = poli[i][0];
		y = poli[i][1];
		if (i == 0)
			ctx.moveTo(x, y);
		else
			ctx.lineTo(x, y);
	}

	ctx.stroke();
	ctx.closePath();


	for (i = 1; i < poli.length; i++) {
		x = poli[i][0];
		y = poli[i][1];
		ctx.beginPath();
		ctx.arc(x, y, 7, 0, Math.PI * 2, 1);
		ctx.fill();
	}
}

cv.onmousedown = function (event) {
	var dx, dy, x, y, d;
	for (var index in poligono) {
		x = poligono[index][0];
		y = poligono[index][1];
		dx = Math.abs(event.clientX - cv.offsetLeft - x);
		dy = Math.abs(event.clientY - cv.offsetTop - y);
		d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

		if (d < 7) {
			if (index == 0)
				nodeIndex = null;
			else {
				/*if (index == 1 && event.clientX <= poligono[2][0]){
					console.log(poligono[2][0]);
					nodeIndex = index;
					break;
				}*/
				nodeIndex = index;
				break;
				/*nodeIndex = index;
				break;*/
			}
		}
	}
}

/*
			if (objetos[i].x < event.clientX && (objetos[i].width + objetos[i].x) > event.clientX &&
				objetos[i].y < event.clientY && (objetos[i].height + objetos[i].y) > event.clientY){
*/

cv.onmouseup = function (event) {
	nodeIndex = null;
	var posiciones = []
	posiciones[0] = poligono[0][0]
	posiciones[1] = poligono[0][1]
	posiciones[2] = poligono[1][0]
	posiciones[3] = poligono[1][1]
	posiciones[4] = poligono[2][0]
	posiciones[5] = poligono[2][1]
	posiciones[6] = poligono[3][0]
	posiciones[7] = poligono[3][1]
	posiciones[8] = poligono[4][0]
	posiciones[9] = poligono[4][1]
	salidaADSR = "ataque en x: " + (x) + " decaimiento en x: " + posiciones[4] + " sostenimiento en x: " + posiciones[6] + " relajacion en x:  " + posiciones[8]
	salidaADSR = [posiciones[2] / 700, posiciones[4] / 700, posiciones[6] / 700, posiciones[8] / 700];
	console.log(salidaADSR);
}

cv.onmousemove = function (event) {
	if (nodeIndex != null) {
		if (nodeIndex == 1) //ataque 
		{
			ctx.clearRect(0, 0, 700, 300);
			if (event.clientX <= poligono[2][0] && event.clientY <= 290 && event.clientY >= 0 && event.clientY <= poligono[2][1]) {
				poligono[nodeIndex][0] = event.clientX;
				poligono[nodeIndex][1] = event.clientY;
			}
		} // ataque
		else if (nodeIndex == 2) //decaimiento
		{
			ctx.clearRect(0, 0, 700, 300);
			if (event.clientX >= poligono[1][0] && event.clientX <= poligono[3][0] && event.clientY >= poligono[1][1] && event.clientY <= poligono[4][1]) {
				poligono[nodeIndex][0] = event.clientX;
				poligono[nodeIndex][1] = event.clientY;
				actualizar();
			}
		}
		else if (nodeIndex == 3) {
			poligono[nodeIndex][1] = poligono[nodeIndex - 1][1];
			ctx.clearRect(0, 0, 700, 300);
			if (event.clientX >= poligono[2][0] && event.clientX <= poligono[4][0])
				poligono[nodeIndex][0] = event.clientX;
		}
		else if (nodeIndex == 4) //decaimiento
		{
			ctx.clearRect(0, 0, 700, 300);
			if (event.clientX >= poligono[3][0] && event.clientX <= 690 && event.clientY <= 290 && event.clientY >= poligono[3][1] && event.clientY <= 290) {
				poligono[nodeIndex][0] = event.clientX;
				poligono[nodeIndex][1] = event.clientY;
			}
		}
	} //condicional null
	function actualizar(event) {
		poligono[3][1] = poligono[2][1];
	}
	dibujaPoligono(poligono);
} // funcion

dibujaPoligono(poligono);