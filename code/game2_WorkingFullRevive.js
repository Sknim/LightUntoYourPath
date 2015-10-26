//if player hits lava first revive makes invincivble
// Map each class of actor to a character
var actorChars = {
  "@": Player,
  "o": Light, // A light will wobble up and down
  "e": Enemy,
  "=": Lava, "|": Lava, "v": Lava
    //
};
var textChars = {
   "t": Text};

function Level(plan) {
  // Use the length of a single row to set the width of the level
  this.width = plan[0].length;
  // Use the number of rows to set the height

  this.height = plan.length;

  // Store the individual tiles in our own, separate array
  this.grid = [];

  // Store a list of actors to process each frame
  this.actors = [];

  // Loop through each row in the plan, creating an array in our grid
  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];

    // Loop through each array element in the inner array for the type of the tile
    for (var x = 0; x < this.width; x++) {
      // Get the type from that character in the string. It can be 'x', '!' or ' '
      // If the character is ' ', assign null.

      var ch = line[x], fieldType = null;
      var Actor = actorChars[ch];
      // Use if and else to handle the three cases
      if (Actor)
        // Create a new actor at that grid position.
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x")
        fieldType = "wall";
      // Because there is a third case (space ' '), use an "else if" instead of "else"
      else if (ch == "!")
        fieldType = "lava";
	  else if (ch == "t")
	    fieldType = 'text';

      // "Push" the fieldType, which is a string, onto the gridLine array (at the end).
      gridLine.push(fieldType);
    }
    // Push the entire row onto the array of rows.
    this.grid.push(gridLine);
  }

  // Find and assign the player character and assign to Level.player
  //filter goes through the function and finds a match
  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];
}
// Check if level is finished
Level.prototype.isFinished = function() {
  if (this.status == 'revive')
    return this.status == undefined; 
	else 
  return this.status != null && this.finishDelay < 0;
};

function Vector(x, y) {
  this.x = x; this.y = y;
}

// Vector arithmetic: v_1 + v_2 = <a,b>+<c,d> = <a+c,b+d>
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

// Vector arithmetic: v_1 * factor = <a,b>*factor = <a*factor,b*factor>
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};
 
  
// A Player has a size,  and position.
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

// Add a new actor type as a class
function Light(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  // Make it go back and forth in a sine wave.
  this.wobble = Math.random() * Math.PI * 2;
}
Light.prototype.type = "light";

//create a new actor type as a class
function Text(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, -0.3));
  this.size = new Vector(.2, .3);
}
Text.prototype.type = "text";

//create a new actor type as a class
function Enemy(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, -0.3));
  this.size = new Vector(.7, .9);
  // Make it walk a little
  this.walk = 1;
}
Enemy.prototype.type = "enemy";

// Lava is initialized based on the character, but otherwise has a
// size and position
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    // Horizontal lava
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    // Vertical lava
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    // Drip lava. Repeat back to this pos.
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";

// Helper function to easily create an element of a type provided 
// and assign it a class.
function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

// Main display class. We keep track of the scroll window using it.
function DOMDisplay(parent, level) {

// this.wrap corresponds to a div created with class of "game"
  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  // In this version, we only have a static background.
  this.wrap.appendChild(this.drawBackground());

  // Keep track of actors
  this.actorLayer = null;

  // Update the world based on player position
  this.drawFrame();
}

var scale = 20;

 /*var animateBackground = function() { 
var backgrounds = [elt('table', 'background'), elt('table', 'background1'), elt('table', 'background2'), elt('table', 'background3'), elt('table', 'background4'), elt('table', 'background5'), elt('table', 'background6'), elt('table', 'background7'),elt('table', 'background8'),elt('table', 'background9'),elt('table', 'background10'),elt('table', 'background11'),elt('table', 'background12'),elt('table', 'background13'),elt('table', 'background14'), elt('table', 'background15'), elt('table', 'background16'), elt('table', 'background17'), elt('table', 'background18')];

   for(var i = 0; i< backgrounds.lenth; i++){
   console.log(backgrounds);}}
      
if (4 === 4){
animateBackground;}*/

DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  table.style.color = '#939399';
 

  // Assign a class to new row element directly from the string from
  // each tile in grid
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};

// All actors are above (in front of) background elements.  
DOMDisplay.prototype.drawActors = function() {
  // Create a new container div for actor dom elements
  var wrap = elt("div");

  // Create a new element for each actor each frame
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(elt("div",
                                    "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  // Update the status each time with this.level.status"
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;

  // We want to keep player at least 1/3 away from side of screen
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  // Change coordinates from the source to our scaled.
  var center = player.pos.plus(player.size.times(0.5))
                 .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

// Remove the wrap element when clearing the display
// This will be garbage collected
DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

// Return the first obstacle found given a size and position.
Level.prototype.obstacleAt = function(pos, size) {
  // Find the "coordinate" of the tile representing left bound
  var xStart = Math.floor(pos.x);
  // right bound
  var xEnd = Math.ceil(pos.x + size.x);
  // top bound
  var yStart = Math.floor(pos.y);
  // Bottom bound
  var yEnd = Math.ceil(pos.y + size.y);

  // Consider the sides and top and bottom of the level as walls
  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
  if (yEnd > this.height)
	return 'lava';

  // Check each grid position starting at yStart, xStart
  // for a possible obstacle (non null value)
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

// Collision detection for actors is handled separately from 
// tiles. 
Level.prototype.actorAt = function(actor) {
  // Loop over each actor in our actors list and compare the 
  // boundary boxes for overlaps.
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    // if the other actor isn't the acting actor
    if (other != actor &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.y + actor.size.y > other.pos.y &&
        actor.pos.y < other.pos.y + other.size.y)
      // check if the boundaries overlap by comparing all sides for
      // overlap and return the other actor if found
      return other;
	}
};

// Update simulation each step based on keys & step size
Level.prototype.animate = function(step, keys) {
//Have game continue past win or loss
	if (this.status != null)
	  this.finishDelay -= step;
	
  // Ensure each is maximum 100 milliseconds 
  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor) {
      // Allow each actor to act on their surroundings
      actor.act(thisStep, this, keys);
    }, this);
   // Do this by looping across the step size, subtracing either the
   // step itself or 100 milliseconds
    step -= thisStep;
  }
};

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);//this hits the wall and turns enemy around can use for enemies
};

var maxStep = 0.05;

var wobbleSpeed = 8, wobbleDist = 0.07;

Light.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

var maxStep = 0.05;

var walkSpeed = 5, walkDist = 4;

Enemy.prototype.act = function(step) {
  this.walk += step * walkSpeed;
  var walkPos = Math.cos(this.walk) * walkDist;
  this.pos = this.basePos.plus(new Vector(walkPos, 0));
};

var maxStep = 0.05;

var playerXSpeed = 14;

Player.prototype.moveX = function(step, level, keys, player) {
  this.speed.x = 0;
  if (keys.left){
  var players = document.getElementsByClassName('player');
  this.speed.x -= playerXSpeed;
    players.backgroundImage = 'GuyLeft.png';
    }
  
  if (keys.right) this.speed.x += playerXSpeed;
  var motion = new Vector(this.speed.x * step, 0);
  // Find out where the player character will be in this frame
  var newPos = this.pos.plus(motion);
  // Find if there's an obstacle there
  var obstacle = level.obstacleAt(newPos, this.size);
  //Handle lava by calling playerTouched
  if (obstacle)
  
  level.playerTouched(obstacle);
  else
    this.pos = newPos;
  };

var gravity = 52;
var jumpSpeed = 20;


Player.prototype.moveY = function(step, level, keys) {
  // Accelerate player downward (always)
  this.speed.y += step * gravity;;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size); 
  // The floor is also an obstacle -- only allow players to 
  // jump if they are touching some obstacle.
  if (obstacle) {
     level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys, pos, size, actor) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);
	
	//losing animation
	if (level.status == 'lost')
	{ this.pos.y += 0.01;
	  this.size.y -= 0.01;
	  finishDelay = undefined;
	  }
	  if (level.status == 'revive'){
		for(var i = 0; i < 1; i++)
	{this.pos.y -= i;
	  this.size.y += i;
	  finishDelay = undefined;}
	  //ensures they can't live below a certain size
	      if (this.size.y <= .1)
		  {console.log('dumb');
		  level.status = 'lost'; 
		  finishDelay = .2;}
	  }
    if (level.status == 'won' && level.type == 'wall'){
	  finishDelay = 1;}}
	 
	  
Level.prototype.playerTouched = function(type, actor) {
  if (type == 'lava' && this.status == null) {
    this.status = 'lost';
	this.finishDelay = 4;
	}else  if (type == "enemy" && this.status == null) {
    this.status = 'lost';
	this.finishDelay = 4;
	  }else if (this.status == 'lost' && type == 'light'){
	 this.status = 'revive';}
	 else if (type == 'light'){
	this.actors = this.actors.filter(function(other) {
      return other != actor;
	  });
	
	 if (!this.actors.some(function(actor){
	 return actor.type == 'light';})){
	     this.status = 'won';
		  this.finishDelay = .2;
	 }} 
	 if (type == 'lava' && this.status == 'revive') {
        this.status = 'lost';
	   this.finishDelay = 2;
	   if (this.status == 'lost' && type == 'light'){
	   this.status = 'revive';}}
	else if (type == "enemy" && this.status == 'revive') {
       this.status = 'lost';
	   this.finishDelay = 2;
	   if (this.status == 'lost' && type == 'light'){
	   this.status = 'revive';}}
	    else if (type == 'light'){
	this.actors = this.actors.filter(function(other) {
      return other != actor;
	  });
	
	 if (!this.actors.some(function(actor){
	 return actor.type == 'light';})){
	     this.status = 'won';
		  this.finishDelay = .2;
	 }} 
	
	}
	
// Arrow key codes for readibility
var arrowCodes = {37: "left", 38: "up", 39: "right"};

// Translate the codes pressed from a key event
function trackKeys(codes) {
  var pressed = Object.create(null);

  // alters the current "pressed" array which is returned from this function. 
  // The "pressed" variable persists even after this function terminates
  // That is why we needed to assign it using "Object.create()" as 
  // otherwise it would be garbage collected

  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      // If the event is keydown, set down to true. Else set to false.
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      // We don't want the key press to scroll the browser window, 
      // This stops the event from continuing to be processed
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

// frameFunc is a function called each frame with the parameter "step"
// step is the amount of time since the last call used for animation
function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      // Set a maximum frame step of 100 milliseconds to prevent
      // having big jumps
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// This assigns the array that will be updated anytime the player
// presses an arrow key. We can access it from anywhere.
var arrows = trackKeys(arrowCodes);

// Organize a single level and begin animation
function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);

  runAnimation(function(step) {
    // Allow the viewer to scroll the level
    level.animate(step, arrows);
    display.drawFrame(step);
	if (level.isFinished()) {
		display.clear();
		if (andThen)
	andThen(level.status);
			return false;}
  });
}

function runGame(plans, Display) {
  function startLevel(n) {
    // Create a new level using the nth element of array plans
    // Pass in a reference to Display function, DOMDisplay (in index.html).
	
    runLevel(new Level(plans[n]), Display, function(status) {
		if(status == 'lost')
		  startLevel(n);         //
		else if (n < plans.length - 1)
			startLevel(n + 1);
		else
			console.log('You win!');
			});
  }
  startLevel(0);
}

