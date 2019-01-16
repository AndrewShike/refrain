inlets = 1;
outlets = 1;

include("grid.js");
include("andrew.js");

var LO = 7;
var HI = 11;

var page = 0;
var kpage = 0;

var livetrack;
var pages;
var patterns = [];

var controls = [];

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

var init = function() {
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
	
	controls.root0 = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 0; });
	controls.root1 = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 1; });
	controls.root2 = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 2; });
	controls.root3 = new Value(0, [[1,2,3,4,5,6,7,8,9,10,11,12], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 0 && kpage == 3; });
	
	controls.oct0 = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 0; });
	controls.oct1 = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 1; });
	controls.oct2 = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 2; });
	controls.oct3 = new Value(5, [[1,2,3,4,5,6,7,8,9,10], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 0 && kpage == 3; });
	
	controls.row0 = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 4], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
	controls.row1 = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 5], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
	controls.row2 = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 6], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
	controls.row3 = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 7], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
	
	controls.scale.event = function() {
		controls.marks.p[0] = [];
		
		for(var i = 0; i < controls.scale.v.length; i++) {
			controls.marks.p[0].push(controls.scale.p[0][controls.scale.v[i]]);
		}
		
		redraw();
	}
	
	controls.scale.event();
	
	/*
	patterns[0] = new Pattern(controls.p0, update);
	patterns[1] = new Pattern(controls.p1, update);
	patterns[2] = new Pattern(controls.p2, update);
	patterns[3] = new Pattern(controls.p3, update);
	*/
	
	for(i in controls) {
		if(controls[i].draw) controls[i].draw(g);
	}
	
	livetrack.draw(g);
	pages.draw(g);
	
	g.refresh();
}