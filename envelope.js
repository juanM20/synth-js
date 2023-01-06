var cv, ctx, nodeIndex, x, y, altura, ancho, salidaADSR;
cv = document.getElementById('lienzo');

ctx = cv.getContext('2d');
nodeIndex = null;
altura = 300
ancho = 700

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