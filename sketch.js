
var data;
var url;

var lastupdated;

var todaySessions;

var t;

var cgreen;
var cyellow;
var cwhite;

var offset;
var nfinished;

var fontCabinSketchRegular, fontCabinSketchBold;

var currentday;

function preload(){
	fontCabinSketchRegular = loadFont("assets/Cabin_Sketch/CabinSketch-Regular.ttf");
	fontCabinSketchBold = loadFont("assets/Cabin_Sketch/CabinSketch-Bold.ttf");
//	data = loadJSON(url);
}
function setup(){
	createCanvas(windowWidth,windowHeight);
	todaySessions = [];
	lastupdated = millis();
	currentday = day();
  url = 'https://anachronauts.com/itp-camp-sessions'
	reloadJSON();

	t = 0;

	cgreen = color(143,179,71);
	cyellow = color(235,172,31);
	cwhite = color(249,249,244);
	cgray = color(52);

	offset  = 0;

	nfinished = 0;



}

function draw(){
	background(cgray);

	fill(cwhite);
	noStroke();
	textSize(80);
	textFont(fontCabinSketchRegular);
	text("Today's Sessions!",20,100);



	var session;
	var x, y;
	var tSize = 16;
	var rwidth = 300;
	var rheight = 150;
	strokeWeight(5);
	var i;
	var b;
	for(a in todaySessions){
		if(a<nfinished){
			i = a;
		}
		else{
			b = a-nfinished;
			i = nfinished + (b+offset)%(todaySessions.length-nfinished);
		}
		session = todaySessions[i];
		x = session.pos.x;
		y = session.pos.y;

		var c;
		var tc;

		var statustext;

		var scheduletext = session.startHour+":"+twoZeroPad(session.startMinute)+" - "+session.endHour+":"+twoZeroPad(session.endMinute);

		switch(session.status){
			case "happening":
				c = cgreen;
				tc = cwhite;

				statustext = "HAPPENING NOW!";
				break;
			case "finished":
				c = color(100);
				tc = c;

				statustext = "Already finished";
				break;
			case "notstarted":
				tc = cwhite;

				var timedif = session.startMinutesDay - getNowMinutes();

				var timestr;

				if(timedif >= 60){

					c = cwhite;
					timestr = floor(timedif/60) + " h ";

					if(timedif%60 > 0){
						timestr+= (timedif%60) + " min";
					}
				}
				else{
					c = cyellow;
					timestr = timedif + " min";
				}

				statustext = "Starting in "+timestr;
				break;

		}

		stroke(c);
		fill(52,200);
		rect(x,y,rwidth,rheight,20);

		fill(tc,255);
		noStroke();
		// Session title
//		textFont(fontCabinSketchBold);

		textSize(tSize*1.1);
		textFont(fontCabinSketchRegular);
		text(session.title,x+tSize,y+tSize,rwidth-tSize,rheight);

		// Schedule text

		textSize(tSize);
		textFont(fontCabinSketchRegular);
		text(scheduletext,x+tSize,y+7.5*tSize);

		// Status text
		textSize(tSize*0.9);
		fill(tc,255);
		noStroke();
		text(statustext,x+tSize,y+8.5*tSize);

		// Room text
		textSize(tSize);
		fill(tc,255);
		noStroke();
		var w = textWidth(session.room);
		text(session.room,rwidth - w + x - tSize,y+rheight-2*tSize,rwidth-tSize,rheight);

		var force = createVector(0,0.001);

		var rand = p5.Vector.random2D();
		rand.mult(0.1);

		force.add(rand);

		var wallsmag = 0.1;
		var wall = 4;
		var k = 3;
		var d;
		var bounce = createVector(0,0);
		if(session.pos.x>width-k*rwidth){
			d = width-rwidth - session.pos.x;
			bounce = createVector(-wall/(d+1),0);
//			bounce = createVector(-wallsmag,0);
		}
		else if(session.pos.x<k*rwidth){
			d = session.pos.x;
			bounce = createVector(wall/(d+1),0);
//			bounce = createVector(wallsmag,0);
		}
		force.add(bounce);

		if(session.pos.y>height-k*rheight){
			d = height-rheight - session.pos.y;
			bounce = createVector(0,-wall/(d+1));
//			bounce = createVector(0,-wallsmag);
		}
		else if(session.pos.y<k*rheight){
			d = session.pos.y - rheight;
			bounce = createVector(0,wall/(d+1));
//			bounce = createVector(0,wallsmag);
		}

		force.add(bounce);

		var session2;
		var dif,mag;
		var rep = 6000;
		for(j in todaySessions){
			if(i!=j){
				session2 = todaySessions[j];
				dif = p5.Vector.sub(session.pos,session2.pos);
				mag = dif.mag();
				dif.normalize();
				dif.mult(rep/(mag*mag));

				if(session2.status == "finished"){
					dif.mult(0.1);
				}
				force.add(dif);

			}
		}



		session.acc.set(force);
		session.vel.add(session.acc);

		var maxvel = 1.5;
		session.vel.x = constrain(session.vel.x,-maxvel,maxvel);
		session.vel.y = constrain(session.vel.y,-maxvel,maxvel);


		session.pos.add(session.vel);

		session.pos.x = constrain(session.pos.x,0,width-rwidth);
		session.pos.y = constrain(session.pos.y,rheight,height-rheight);

		/*
		if(session.pos.y>height-rheight){
			session.vel.y *= -1;
		}
		*/






	}

	t+=0.001;

	if(frameCount%120 == 0){
		offset = (offset+1)%(todaySessions.length-nfinished);
	}

	// Update
	if(millis()-lastupdated>1000*60){
		console.log("reloading");
		reloadJSON();
		lastupdated = millis();
	}


}

function twoZeroPad(n){
	var str = ""+n;
	var pad = "00";
	return pad.substring(0,pad.length-str.length) + str;
}

function reloadJSON(){
	loadJSON(url,loadData);
	console.log("json reloaded");
}

function loadData(data){
	console.log("Loading data");
	var el;
	nfinished = 0;
	// New day!
	if(day() != currentday){
		currentday = day();
		todaySessions = [];
	}

	for(i in data){
		el = data[i];
		var session = [];
		if(el.status === "live" && el.enabled === "1" && el.rsvps.length>0){
			var tokens = dateTokens(el.datetime_start);
			if(isDay(tokens,year(),month(),day())){
				session.id = el.id;
				session.title = el.title;
				session.room = el.location.name;
				if(session.room == undefined){
					session.room = "(No Room Assigned)";
				}
				session.rsvpsN = el.rsvps.length;
				session.datetime_start = el.datetime_start;
				session.datetime_end = el.datetime_end;

				session.startYear = int(tokens[0]);
				session.startMonth = int(tokens[1]);
				session.startDay = int(tokens[2]);
				session.startHour = int(tokens[3]);
				session.startMinute = int(tokens[4]);

				tokens = dateTokens(el.datetime_end);
				session.endYear = int(tokens[0]);
				session.endMonth = int(tokens[1]);
				session.endDay = int(tokens[2]);
				session.endHour = int(tokens[3]);
				session.endMinute = int(tokens[4]);

				var nowMinutes = getNowMinutes();
				session.startMinutesDay = session.startHour*60 + session.startMinute;
				session.endMinutesDay = session.endHour*60 + session.endMinute;



				if(session.startMinutesDay > nowMinutes){
					session.status = "notstarted";
				}
				else if(session.endMinutesDay > nowMinutes){
					session.status = "happening";
				}
				else{
					session.status = "finished";
					nfinished++;
				}


				console.log("Today");
				console.log(el.id);
				console.log(el.title);
				console.log("Room: "+el.location.name);
				console.log("RSVPS: "+el.rsvps.length);
				console.log(session.status);
				console.log(el.datetime_start);

				var id = hasId(todaySessions,el.id);
				console.log(id);
				if(id<0){
					session.pos = createVector(random(width),random(height));
					session.vel = createVector(0,0);
					session.acc = createVector(0,0);
					todaySessions.push(session);
				}
				else{
					session.pos = todaySessions[i].pos;
					session.vel = todaySessions[i].vel;
					session.acc = todaySessions[i].acc;
					todaySessions[i] = session;
				}
			}
		}
	}


	// Sorting
	todaySessions.sort(function(a,b){
		if(a.status === b.status || a.status != "finished"){
			return a.startMinutesDay -  b.startMinutesDay;
		}
		else{
			return -1;
		}
	});


	console.log(todaySessions);
	console.log("Nfinished "+nfinished);
}

function getNowMinutes(){
	return hour()*60 + minute();
//	return (18)*60 + minute();
}

function hasId(s, id){
	for(i in s){
		if(s[i].id == id){
			return i;
		}
	}
	return -1;

}

function dateTokens(text){
	var tokens = splitTokens(text,["-"," ",":"]);
	return tokens;
}

function isToday(tokens){
	return isToday(tokens,year(),month(),day());

}

function isDay(tokens, year, month, day){
	var y = tokens[0];
	var m = tokens[1];
	var d = tokens[2];

	return (y==year) && (m==month) && (d==day);

}

function windowResized(){
	resizeCanvas(windowWidth,windowHeight);
}
