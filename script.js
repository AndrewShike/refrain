inlets = 1;
outlets = 1;

include("grid.js");
include("andrew.js");

var g = grid.connect();

var LO = 7;
var HI = 11;

var page = 0;
var kpage = 0;

var livetrack;
var pages;
var patterns = [];

var controls = [];

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

livetrack = new Value(-1, [15, [0, 1, 2, 3]], [[LO, LO, LO, LO], HI], function() { return 1; });
livetrack.event = function(v, last) {
	output("settrack", v);
	
	this.v = last;
}

input["thistrack"] = function(n) {
	livetrack.v = n;
	livetrack.draw(g);
	g.refresh();
}

pages = new Value(0, [15, [4, 5, 6, 7]], [[0, 0, 0, 0], HI], function() { return 1; });
pages.event = function(v) {
	page = v;
	redraw();
}

controls.ccs = {}
controls.ccs.faders = [];
controls.ccs.buttons = [];
controls.ccs.globals = [];
	
for(var i = 0; i < 3; i++) {
	for(var j = 0; j < 4; j++) {
		controls.ccs.faders[i * 4 + j] = new Fader(0, [[1, 13], j], [0, HI, LO], function() {});
		controls.ccs.faders[i * 4 + j].index = i;
		controls.ccs.faders[i * 4 + j].pg = function() { return page == this.index }
		
		controls.ccs.buttons[i * 4 + j] = new Toggle(0, [0, j], [LO, HI], function() {});
		controls.ccs.buttons[i * 4 + j].index = i;
		controls.ccs.buttons[i * 4 + j].pg = function() { return page == this.index }
			
		if(i == 0) {
			controls.ccs.globals[j] = new Toggle(0, [14, j], [LO, HI], function() { return 1; });
			controls.ccs.globals[j].index = j;
		}
	}
}

controls.ccs.draw = function(g) {
	for(var i = 0; i < 12; i++) {
		controls.ccs.faders[i].draw(g);
		controls.ccs.buttons[i].draw(g);
		if(i < 4) controls.ccs.globals[i].draw(g);
	}
}

controls.ccs.look = function(x,y,z) {
	for(var i = 0; i < 12; i++) {
		controls.ccs.faders[i].look(x,y,z);
		controls.ccs.buttons[i].look(x,y,z);
		if(i < 4) controls.ccs.globals[i].look(x,y,z);
	}
}

input["livemap"] = function(n) {
	if(n[1] == "map") {
		if(n[2] == 0 && n[0] < 12) {
			controls.ccs.buttons[n[0]].v == 0;
			controls.ccs.buttons[n[0]].task.cancel();
			controls.ccs.buttons[n[0]].b[1] = controls.ccs.buttons[n[0]].bb[1];
			controls.ccs.buttons[n[0]].b[0] = 0;
			controls.ccs.buttons[n[0]].mapped = 1;
			
			controls.ccs.faders[n[0]].pg = controls.ccs.faders[n[0]].pp;
			
			redraw();
		}
		else if(n[0] < 12) {
			controls.ccs.buttons[n[0]].v = n[2];
		}
		else if(n[2] == 0) {
			controls.ccs.globals[n[0] - 12].task.cancel();
			controls.ccs.globals[n[0] - 12].b[1] = controls.ccs.globals[n[0] - 12].bb[1];
			controls.ccs.globals[n[0] - 12].b[0] = 0;
			
			controls.ccs.globals[n[0] - 12].mapped = 1;
			controls.ccs.globals[n[0] - 12].v = 0;
			
			redraw();
		}
	}
	else {
		controls.ccs.faders[n[0]].v = Math.round(n[1] * 12);
		controls.ccs.faders[n[0]].draw(g);
		g.refresh();
	}
}

for(var i = 0; i < 12; i++) {
	controls.ccs.buttons[i].mapped = 0;
	
	controls.ccs.faders[i].pp = controls.ccs.faders[i].pg;
	controls.ccs.faders[i].pg = function() { return 0; };
	
	controls.ccs.buttons[i].bb = controls.ccs.buttons[i].b.slice();
	controls.ccs.buttons[i].task = new Task(function() {
		if(this.b[1] == this.bb[1]) this.b[1] = this.bb[0];
		else this.b[1] = this.bb[1];
		redraw();
	}, controls.ccs.buttons[i]);
	
	controls.ccs.buttons[i].event = function(v, last) {
		if(this.mapped) {
			output("livemap", this.index, "cancel");
			controls.ccs.faders[this.index].pg = function() { return 0; };
			
			this.mapped = 0;
			this.b[0] = this.bb[0];
			this.event(v);
		}
		else {
			if(v) { 
				output("livemap", this.index, "map", v);
				this.task.repeat();
			}
			else { /*
				this.task.cancel();
				this.b[1] = this.bb[1];
				this.b[0] = 0;
				this.mapped = 1; */
				this.v = 1;
			}
		}
	}
	
	controls.ccs.faders[i].event = function(v) {
		if(controls.ccs.buttons[this.index].mapped) output("livemap", this.index, v / 12);
	}
}

for(var i = 0; i < 4; i++) {
	controls.ccs.globals[i].mapped = 0;
	
	controls.ccs.globals[i].bb = controls.ccs.buttons[i].b.slice();
	controls.ccs.globals[i].task = new Task(function() {
		if(this.b[1] == this.bb[1]) this.b[1] = this.bb[0];
		else this.b[1] = this.bb[1];
		redraw();
	}, controls.ccs.globals[i]);
	
	controls.ccs.globals[i].event = function(v, last) {
		if(this.mapped) {
			//output("livemap", this.index + 12, "cancel");
			//this.mapped = 0;
			
			this.b[1] = this.bb[1];
			this.b[0] = 0;
			
			output("livemap", this.index + 12, v);
		}
		else {
			if(v) { 
				output("livemap", this.index + 12, "map", v);
				this.task.repeat();
			}
			else { /*
				this.task.cancel();
				this.b[1] = this.bb[1];
				this.b[0] = 0;
				this.mapped = 1; */
				this.v = 1;
			}
		}
	}
}

controls.scale = new Toggles([0,1,2,3,4,5,6,7,8,9,10,11], [[0, 1,2,3,4,5,6,7,8,9,10,11], 0], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 3; });
controls.marks = new Toggles([0], [[], 1], [[0,0,0,0,0,0,0,0,0,0,0,0], LO], function() { return page == 3; });

controls.kpages =  new Value(0, [[10, 11, 12, 13], 3], [[LO,LO,LO,LO], HI], function() { return page == 3; });
controls.kpages.event = function(v) {
	kpage = v;
	redraw();
}

controls.rows = {}

controls.rows.root = [];
controls.rows.root[0] = new Value(0, [[0,1,2,3,4,5,6,7,8,9,10,11], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 3 && kpage == 0; });
controls.rows.root[1] = new Value(0, [[0,1,2,3,4,5,6,7,8,9,10,11], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 3 && kpage == 1; });
controls.rows.root[2] = new Value(0, [[0,1,2,3,4,5,6,7,8,9,10,11], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 3 && kpage == 2; });
controls.rows.root[3] = new Value(0, [[0,1,2,3,4,5,6,7,8,9,10,11], 2], [[0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return page == 3 && kpage == 3; });

controls.rows.oct = [];
controls.rows.oct[0] = new Value(5, [[0,1,2,3,4,5,6,7,8,9], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 3 && kpage == 0; });
controls.rows.oct[1] = new Value(5, [[0,1,2,3,4,5,6,7,8,9], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 3 && kpage == 1; });
controls.rows.oct[2] = new Value(5, [[0,1,2,3,4,5,6,7,8,9], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 3 && kpage == 2; });
controls.rows.oct[3] = new Value(5, [[0,1,2,3,4,5,6,7,8,9], 3], [[0,0,0,0,0,LO,0,0,0,0], HI], function() { return page == 3 && kpage == 3; });

controls.rows.keyb = [];
controls.rows.keyb[3] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13], 4], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[2] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13], 5], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[1] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13], 6], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });
controls.rows.keyb[0] = new Momentaries([], [[0,1,2,3,4,5,6,7,8,9,10,11,12,13], 7], [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], HI], function() { return 1; });

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

controls.scale.event = function() {
	controls.marks.p[0] = [];
	
	for(var i = 0; i < controls.scale.v.length; i++) {
		controls.marks.p[0].push(controls.scale.p[0][controls.scale.v[i]]);
		//controls.marks.p[0].sort();
	}
	
	for(var i = 0; i < 4; i++) {
		controls.rows.root[i].p[0] = [];
	
		for(var j = 0; j < controls.scale.v.length; j++) {
			controls.rows.root[i].p[0].push(controls.scale.p[0][controls.scale.v[j]]);
			//controls.marks.p[0].sort();
		}
	}
	
	controls.marks.event();
	redraw();
}

controls.marks.event = function(v, last) {
	for(var i = 0; i < 4; i++) {
		controls.rows.keyb[i].b[0] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		
		for(var j = -Math.ceil(controls.rows.keyb[0].p[0].length / controls.scale.v.length); j < Math.ceil(controls.rows.keyb[0].p[0].length / controls.scale.v.length); j++) {
			for(var k = 0; k < controls.marks.v.length; k++) {
				controls.rows.keyb[i].b[0][controls.marks.v[k] + (j * controls.scale.v.length) - controls.rows.root[i].v] = LO;
			}
		}
	}
	
	redraw();
}

for(var i = 0; i < 4; i++) {
	controls.rows.keyb[i].index = i;
	
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
		key += controls.rows.root[this.index].v;
		key = controls.scale.v[key % controls.scale.v.length] + ((Math.floor(key / controls.scale.v.length) + controls.rows.oct[this.index].v) * controls.scale.p[0].length);
		
		output("key", key, gate);
		
		/*
		if(gate) {
			controls.kpages.v = this.index;
			controls.kpages.event(this.index);
		}*/
	}
	
	controls.rows.root[i].event = function(v) {
		this.v = v;
		
		controls.scale.event();
	}
	
	controls.rows.oct[i].event = function(v) {
		this.v = v;
		
		controls.scale.event();
	}
}

for(var i = 0; i < 4; i++) {
	controls.p0 = new Toggle(0, [14, 4], [0, LO, HI], function() { return 1; });
	controls.p1 = new Toggle(0, [14, 5], [0, LO, HI], function() { return 1; });
	controls.p2 = new Toggle(0, [14, 6], [0, LO, HI], function() { return 1; });
	controls.p3 = new Toggle(0, [14, 7], [0, LO, HI], function() { return 1; });
}

patterns[0] = new Pattern(controls.p0, update);
patterns[1] = new Pattern(controls.p1, update);
patterns[2] = new Pattern(controls.p2, update);
patterns[3] = new Pattern(controls.p3, update);

var init = function() {
	controls.scale.event();
	controls.marks.event();
	
	for(i in controls) {
		if(controls[i].draw) controls[i].draw(g);
	}
	
	livetrack.draw(g);
	pages.draw(g);
	
	g.refresh();
}