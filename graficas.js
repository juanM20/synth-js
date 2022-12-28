const canvas = document.createElement('chartContainer');
const ctx = canvas.getContext('2d', {willReadFrequently: true});

function setGraphs(){
    var typeG = document.getElementById("typeGraphs").value;
    if (typeG == "cuadrada"){
        setSquare();
    }
    else if (typeG == "sinusoidal"){
        setSin();
    }
    else if (typeG == "triangular"){
        setTriangle();
    }
    else if (typeG == "sierra"){
        setSierra();
    }
}



function setSquare(){
    var square = new CanvasJS.Chart( "chartContainer", {
        title:{
            text: "Onda Cuadrada"
        },
        axisX:{
            interval: 1,
        },
        data: [{
            type: "line",
            dataPoints: []
        }]
    });
    dataSquare(square);
    square.render();

    function dataSquare(chart){
        var i=0;
        while (i<5) {
            var y = Math.pow(-1, Math.floor(2*(1/2*Math.PI)*i));
            //chart.options.data[0].dataPoints.push({x:i,  y:[0,y] });
            chart.options.data[0].dataPoints.push({y:y });
            i=i+0.1;
        }
      }
}

function setSquare(){
    var square = new CanvasJS.Chart("chartContainer", {
        title:{
            text: "Onda Cuadrada"
        },
        axisY:{
            interval: 1,
        },
        axisX:{
            interval: 1,
        },
        data:[{
            type: "stepLine",
            dataPoints: [
                {x:0, y:-1},
                {x:1, y:1},
                {x:2, y:-1},
                {x:3, y:1},
                {x:4, y:-1},
                {x:5, y:1},
            ]
        }]
    });
    square.render();
}


function setSin(){
    var seno = new CanvasJS.Chart( "chartContainer", {
        title:{
            text: "Onda Sinusoidal"
        },
        axisX:{
            interval: 90,
        },
        data: [{
            type: "line",
            dataPoints: []
        }]
    });
    generateData(seno);
    seno.render();

    function generateData(chart){
        var endAngle = 720;
        for(var i = 0; i < endAngle; i++) {
          var y = Math.sin(i * Math.PI / 180);
          chart.options.data[0].dataPoints.push({ y:y});
        }
      }
}


function setTriangle(){
    var triangle = new CanvasJS.Chart( "chartContainer", {
        title:{
            text: "Onda Triangular"
        },
        axisX:{
            interval: 90,
        },
        data: [{
            type: "line",
            dataPoints: []
        }]
    });
    dataTriangle(triangle);
    triangle.render();

    function dataTriangle(chart){
        var endAngle = 720;
        for(var i = 1; i < 50; i++) {
          var y = 5*(Math.abs( ((i-1) % 4) -2 )) -5;
          chart.options.data[0].dataPoints.push({ y:y});
        }
      }
}


/*function setTriangle(){
    var triangle = new CanvasJS.Chart( "chartContainer", {
        title:{
            text: "Onda Triangular"
        },
        axisX:{
            interval: 90,
        },
        data: [{
            type: "line",
            dataPoints: [
                {y:0},
                {y:3},
                {y:0},
                {y:-3},
                {y:0},
                {y:3},
                {y:0},
                {y:-3},
                {y:0}
            ]
        }]
    });
    triangle.render();
}*/

function setSierra(){
    var sierra = new CanvasJS.Chart( "chartContainer", {
        title:{
            text: "Onda Diente de Sierra"
        },
        axisX:{
            interval: 90,
        },
        data: [{
            type: "line",
            dataPoints: []
        }]
    });
    dataSierra(sierra);
    sierra.render();

    function dataSierra(chart){
        var endAngle = 50;
        for(var i = 0; i < endAngle; i++) {
          var y = -(10/Math.PI)*(Math.atan(1/Math.tan((i+1)*Math.PI/4)));
          chart.options.data[0].dataPoints.push({ y:y});
        }
      }
}

/*
function setSquare(){
    var square = new CanvasJS.Chart("chartContainer", {
        title:{
            text: "Onda Cuadrada"
        },
        axisY:{
            interval: 1,
        },
        axisX:{
            interval: 1,
        },
        data:[{
            type: "stepLine",
            dataPoints: [
                { x: 0, y:0},
                { x: 1, y:0},
                { x: 2, y:1},
                { x: 3, y:0},
                { x: 4, y:-1},
                { x: 5, y:0},
                { x: 6, y:1},
                { x: 7, y:0},
                { x: 8, y:-1},
                { x: 9, y:0},
            ]
        }]
    });

    square.render();
} */