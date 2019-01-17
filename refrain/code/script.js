inlets = 1;
outlets = 1;

include("grid.js");
include("andrew.js");

var g = grid.connect();

var update = function(x, y, z) {
	for(i in controls) {
		if(controls[i].look) controls[i].look(x, y, z);
		if(controls[i].draw) controls[i].draw(g);
		
		output(i, controls[i].v);
	}
	
	g.refresh();
}

g.event = function(x, y, z) {
	if(x < 15) {
		for(var i = 0; i < patterns.length; i++) {
			patterns[i].look(x, y, z);
		}
		
		update(x, y, z);
	}
	else {
		pages.look(x, y, z);
		pages.draw(g);
		
		livetrack.look(x, y, z);
		livetrack.draw(g)
		
		g.refresh();
	}
}

var redraw = function() {
	g.all(0);
	for(i in controls) {
		if(controls[i].draw) controls[i].draw(g);
	}
	
	livetrack.draw(g);
	pages.draw(g);
	
	g.refresh();
}

input["thistrack"] = function(n) {
	livetrack.v = n;
	livetrack.draw(g);
	g.refresh();
}

var LO = 7;
var HI = 11;

var page = 0;
var kpage = 0;

var livetrack;
var pages;
var patterns = [];

var controls = [];

livetrack = new Value(-1, [15, [0, 1, 2, 3]], [[LO, LO, LO, LO], HI], function() { return 1; });
livetrack.event = function(v, last) {
	output("settrack", v);
	
	this.v = last;
}

pages = new Value(0, [15, [4, 5, 6, 7]], [[0, 0, 0, 0], HI], function() { return 1; });
pages.event = function(v) {
	page = v;
	redraw();
}


controls.scale = new Toggles([0,1,2,3,4,5,6,7,8,9,10,11], [[1,2,3,4,5,6,7,8,9,10,11,12], 0], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0; });
controls.marks = new Toggles([0], [[], 1], [[0,0,0,0,0,0,0,0,0,0,0,0], LO], function() { return page == 0; });

controls.kpages =  new Value(0, [[11, 12, 13, 14], 3], [[LO,LO,LO,LO], HI], function() { return page == 0; });
controls.kpages.event = function(v) {
	kpage = v;
	redraw();
}

controls.rows = {}

controls.rows.root = [];
controls.rows.root[0] = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 0; });
controls.rows.root[1] = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 1; });
controls.rows.root[2] = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 2; });
controls.rows.root[3] = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 3; });

controls.rows.oct = [];
controls.rows.oct[0] = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 0; });
controls.rows.oct[1] = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 1; });
controls.rows.oct[2] = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 2; });
controls.rows.oct[3] = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 3; });

controls.rows.keyb = [];
controls.rows.keyb[0] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 4], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[1] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 5], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[2] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 6], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[3] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 7], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });

controls.rows.draw = function(g) {
	for(var i = 0; i < 4; i++) {
		controls.rows.root[i].draw(g);
		controls.rows.oct[i].draw(g);
		controls.rows.keyb[i].draw(g);
	}
}

controls.rows.look = function(x, y, z) {
	for(var i = 0; i < 4; i++) {
		controls.rows.root[i].look(x, y, z);
		controls.rows.oct[i].look(x, y, z);
		controls.rows.keyb[i].look(x, y, z);
	}
}

for(var i = 0; i < 4; i++) {
	controls.rows.keyb[i].event = function(v, last, add, rem) {
		var key;
		var gate;
		
		if(add != -1) {
			key = add;
			gate = 1;
		}
		else if(rem != -1) {
			key = rem;
			gate = 0;
		}
		
		key = controls.scale.v[key % controls.scale.v.length] + (Math.floor(key / controls.scale.v.length) * controls.scale.p[0].length);
		
		
		output("key", key, gate);
	}
}

controls.scale.event = function() {
	controls.marks.p[0] = [];
	
	for(var i = 0; i < controls.scale.v.length; i++) {
		controls.marks.p[0].push(controls.scale.p[0][controls.scale.v[i]]);
	}
	
	redraw();
}

/*
patterns[0] = new Pattern(controls.p0, update);
patterns[1] = new Pattern(controls.p1, update);
patterns[2] = new Pattern(controls.p2, update);
patterns[3] = new Pattern(controls.p3, update);
*/

var init = function() {
	controls.scale.event();
	
	for(i in controls) {
		if(controls[i].draw) controls[i].draw(g);
	}
	
	livetrack.draw(g);
	pages.draw(g);
	
	g.refresh();
}