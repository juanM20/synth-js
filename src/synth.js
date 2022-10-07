import createNoteTable from "./noteTable.js";


const audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;
let compressor = null;
let analyzer = null;

const keyboard = document.querySelector(".keyboard");
const wavePicker = document.querySelector("select[name='waveform']");
const volumeControl = document.querySelector("input[name='volume']");
const compressorControl = document.querySelector("input[name='check-compressor']");

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
	compressor.attack.setValueAtTime(20, audioContext.currentTime);
	compressor.release.setValueAtTime(-5, audioContext.currentTime);

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

const dibujamaximo = (c, m) => {
	c.beginPath();
	c.moveTo(0, 128 + m);
	c.lineTo(20, 128 + m);
	var a = 128 + m;
	c.fillStyle = "rgb(25,255,0)";
	c.fillText(m, 5, a);
	c.stroke();
}

const visualize = () => {
	//Ajustes del canvas
	var canvas = document.querySelector('#canvas');
	var ctd = canvas.getContext('2d');
	var ancho = document.getElementById('visualizer').offsetWidth - 80;
	canvas.width = ancho;
	canvas.height = 256;
	var muestras = new Uint8Array(analyzer.frequencyBinCount);
	analyzer.getByteTimeDomainData(muestras);
	console.log(muestras.length);
	//Dibujamos la forma de onda, incluso podríamos calcular su máximo:
	var max = 0;
	for (var i = 0; i < muestras.length; i++) {
		max = muestras[i] > max ? muestras[i] : max;
	}
	console.log("maximo:  " + max);
	max = max - 128
	for (var i = 0; i < muestras.length; i++) {
		var valor = muestras[i];
		var porcentaje = valor / 256;
		var alto = canvas.height * porcentaje;
		var offset = canvas.height - alto;
		var trazo = canvas.width / muestras.length;
		ctd.fillStyle = "#000";
		ctd.font = "14px Helvetica";
		ctd.fillRect(i * trazo, offset, 1, 1);
		ctd.moveTo(0, 128);
		ctd.lineTo(ancho, 128);
		ctd.stroke();
		ctd.fillText('0', 5, 128)
		//dibujamaximo(ctd, max);
		// //El cálculo del máximo valor nos sirve para determinar el pico de dB
		// document.querySelector('#maximo').innerHTML = max;
		// dB = 20 * Math.log(Math.max((max / 127), Math.pow(10, -42 / 20))) / Math.LN10;
		// document.querySelector('#dB').innerHTML = dB;
		// dBs = 20 * Math.log(0.5) / Math.LN10;
		// document.querySelector('#dBs').innerHTML = dBs;
	}
	requestAnimationFrame(visualize.bind(this));
}

const playTone = (freq) => {
	const osc = audioContext.createOscillator();
	osc.connect(mainGainNode);

	const type = wavePicker.options[wavePicker.selectedIndex].value;

	if (type === "custom") {
		osc.setPeriodicWave(customWaveform);
	} else {
		osc.type = type;
	}

	osc.frequency.value = freq;
	osc.start();

	requestAnimationFrame(visualize.bind(this));

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

const noteReleased = (event) => {
	const dataset = event.target.dataset;
	if (dataset && dataset["pressed"]) {
		const octave = Number(dataset["octave"]);
		oscList[octave][dataset["note"]].stop();
		delete oscList[octave][dataset["note"]];
		delete dataset["pressed"];
	}
}

const changeVolume = (event) => {
	mainGainNode.gain.value = volumeControl.value
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

})

