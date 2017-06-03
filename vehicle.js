/**
 * Created by nomaterials on 03/06/2017.
 */

function Vehicle(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-3, 3), random(-3, 3));
    this.acc = createVector(0, 0);
    this.r = 3;
    this.maxSpeed = 5;  //max speed at which agent moves toward target
    this.maxForce = 0.1;  // bigger values here make more feline turns, whereas smaller give you slower




    this.applyForce = function (force) {
        // var f = force.copy();
        // f.div(this.mass);
        this.acc.add(force);
    };

    //Arrive-Seek behaviour based on Craig Reynold's famous paper
    this.arrive =function (target) {

        var desired = p5.Vector.sub(target, this.pos);

        //The Arrive behaviour
        // var d = desired.mag();
        //
        // if(d<100) {
        //     //map desired mag according to dist
        //     var m = map(d, 0, 100, 0, this.maxSpeed);
        //     desired.setMag(m);
        // } else {
        //     desired.setMag(this.maxSpeed);
        // }

        var steering = p5.Vector.sub(desired, this.vel);
        steering.limit(this.maxForce);

        this.applyForce(steering);
        return steering;
    };

    //Force Field Follow behaviour
    this.follow = function (flow) {
        //look at vector at tile
        var desired = flow.lookup(this.pos);
        //scale it by maxspeed
        desired.mult(this.maxSpeed);
        //calc steering
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        this.applyForce(steer);
    };

    //Seperation behaviour
    this.seperate = function(vehicles) {
        var desiredSeperation = 16;
        var sum = createVector(0, 0);
        var count = 0;

        //for every boid in system, check if its too close
        for(var i = 0; i < vehicles.length; i++) {
            var d = p5.Vector.dist(this.pos, vehicles[i].pos);

            if((d > 0) && (d < desiredSeperation)) {
                //calc vector pointing away from neighbour
                var diff = p5.Vector.sub(this.pos, vehicles[i].pos);
                diff.normalize();
                diff.div(d);  //weight by distance
                sum.add(diff);
                count++;  //tracking of how many
            }
        }

        //Average -- divide by how many
        if (count > 0) {
            sum.div(count);
            // Our desired vector is the average scaled to maximum speed
            sum.normalize();
            sum.mult(this.maxSpeed);
            // Implement Reynolds: Steering = Desired - Velocity
            sum.sub(this.vel);
            sum.limit(this.maxForce);
        }
        return sum;
    };

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    this.align = function(boids) {
        var neighbordist = 100;
        var sum = createVector(0, 0);
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            var steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    };

    // Cohesion
    // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
    this.cohesion = function(boids) {
        var neighbordist = 200;
        var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = p5.Vector.dist(this.pos, boids[i].pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].pos); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.arrive(sum); // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    };

    // We accumulate a new acceleration each time based on three rules
    //to simulate the intelligent complex behaviour of flocking
    this.flock = function(boids) {
        var sep = this.seperate(boids); // Separation
        var ali = this.align(boids);    // Alignment
        var coh = this.cohesion(boids); // Cohesion

        // Arbitrarily weight these forces
        sep.mult(separationSlider.value());
        ali.mult(alignmentSlider.value());
        coh.mult(cohesionSlider.value());

        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    };

    //Combine seek & seperate behaviours ***Adjust weight of each behaviour***
    this.applyBehaviours = function(vehicles) {
        var seperateForce = this.seperate(vehicles);
        var seekForce = this.arrive(createVector(mouseX, mouseY));

        //ADJUST WEIGHT HERE
        seperateForce.mult(seperateForceSlider.value());
        seekForce.mult(seekForceSlider.value());

        this.applyForce(seperateForce);
        this.applyForce(seekForce);
    };

    // Wraparound
    this.borders = function() {
        if (this.pos.x < -this.r) this.pos.x = width+this.r;
        if (this.pos.y < -this.r) this.pos.y = height+this.r;
        if (this.pos.x > width+this.r) this.pos.x = -this.r;
        if (this.pos.y > height+this.r) this.pos.y = -this.r;
    };


    this.update = function () {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);
    };

    this.display = function() {
        // Draw a triangle rotated in the direction of velocity
        var theta = this.vel.heading() + PI/2;
        fill(127);
        stroke(200);
        strokeWeight(1);

        push();
        translate(this.pos.x,this.pos.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r*2);
        vertex(-this.r, this.r*2);
        vertex(this.r, this.r*2);
        endShape(CLOSE);
        pop();
    };

    this.run = function() {
        this.update();
        this.borders();
        this.display();
    }

}