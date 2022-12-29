import createNoteTable from "./noteTable.js";


const audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;
let gateGain = null;
let compressor = null;
let analyzer = null;

const keyboard = document.querySelector(".keyboard");
const wavePicker = document.querySelector("select[name='waveform']");
const graphPicker = document.querySelector("select[name='graphic-select']");
const volumeControl = document.querySelector("input[name='volume']");
const compressorControl = document.querySelector("input[name='check-compressor']");
const attackInput = document.querySelector("input[name='attack-input']");
const decayInput = document.querySelector("input[name='decay-input']");
const sustainInput = document.querySelector("input[name='sustain-input']");
const releaseInput = document.querySelector("input[name='release-input']");

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

	/* Inicializar compresión ADSR */
	compressor = audioContext.createDynamicsCompressor();
	compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
	compressor.knee.setValueAtTime(40, audioContext.currentTime);
	compressor.ratio.setValueAtTime(12, audioContext.currentTime);
	compressor.attack.setValueAtTime(.5, audioContext.currentTime);
	compressor.release.setValueAtTime(.5, audioContext.currentTime);

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

	ctx.fillText("105%", 0, 64);
	ctx.fillText("70db", 0, 128);
	ctx.fillText("35%", 0, 192);
	ctx.fillText("25%", 336, 255);
	ctx.fillText("50%", 672, 255);
	ctx.fillText("75%", 1008, 255);
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

compressorControl.addEventListener('change', (e) => {

	if (e.target.checked) {
		mainGainNode.disconnect(analyzer);
		mainGainNode.connect(compressor);
		compressor.connect(analyzer);
	}
	else {
		mainGainNode.disconnect(compressor);
		compressor.disconnect(analyzer);
		mainGainNode.connect(analyzer);

	}

});

attackInput.addEventListener('change', e => {
	ADSR.attack = e.target.value;
});

decayInput.addEventListener('change', e => {
	ADSR.decay = e.target.value;
})

sustainInput.addEventListener('change', e => {
	ADSR.sustain = e.target.value;
})

releaseInput.addEventListener('change', e => {
	ADSR.release = e.target.value;
})
