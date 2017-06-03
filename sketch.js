/**
 * Created by nomaterials on 03/06/2017.
 */


// Using this variable to decide whether to draw all the stuff
var debug = true;

//Use forcefield
var flow = false;

//Flow field of vectors
var flowfield;

//Array to store agents
var pop = 250;  // vehicle population
var vehicles = [];

//GUI elements
var cohesionSlider;
var separationSlider;
var alignmentSlider;


function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);


    cohesionSlider   = createSlider(0, 5, 1, 0.1);
    separationSlider = createSlider(0, 5, 1, 0.1);
    alignmentSlider  = createSlider(0, 5, 1, 0.1);

    //make new flowfield obj with resolution 16
    if(flow)
        flowfield = new FlowField(20);

    for (var i = 0; i < 400; i++) {
        vehicles.push(new Vehicle(random(width), random(height), random(2.5, 5), random(0.1, 0.5)));
    }
}

function draw() {
    background(51);

    // Display the flowfield in "debug" mode
    if (debug && flow)
        flowfield.display();

    for(var i = 0; i < vehicles.length; i++) {

        //Apply Seek & Seperate behaviours
        //vehicles[i].applyBehaviours(vehicles);

        //Follow force field
        if(flow)
            vehicles[i].follow(flowfield);

        //Flock behaviour
        vehicles[i].flock(vehicles);

        vehicles[i].run();
    }

}

function keyPressed() {
    if (key == ' ') {
        debug = !debug;
    }
}

// Make a new flowfield
function mousePressed() {
    if(flow)
        flowfield.init();
}