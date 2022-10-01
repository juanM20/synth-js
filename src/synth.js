import createNoteTable from "./noteTable.js";


const audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;
let compressor = null;

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
	compressor.attack.setValueAtTime(0, audioContext.currentTime);
	compressor.release.setValueAtTime(0.25, audioContext.currentTime);

	/* Conectar el el nodo principal de ganancia a la salida de audio */
	mainGainNode.connect(audioContext.destination);
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
		mainGainNode.disconnect(audioContext.destination);
		mainGainNode.connect(compressor);
		compressor.connect(audioContext.destination);
	}
	else {
		mainGainNode.disconnect(compressor);
		compressor.disconnect(audioContext.destination);
		mainGainNode.connect(audioContext.destination);

	}

})

