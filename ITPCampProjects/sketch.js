
var data;
var url;

var lastupdated;

var projects;

var t;

var cgreen;
var cyellow;
var cwhite;

var offset;
var nfinished;

var fontCabinSketchRegular, fontCabinSketchBold;

var currentday;

var colors = [];

var enabledi;
var lastMillis;

var mouseIsClicked;

function preload(){
	fontCabinSketchRegular = loadFont("assets/Cabin_Sketch/CabinSketch-Regular.ttf");
	fontCabinSketchBold = loadFont("assets/Cabin_Sketch/CabinSketch-Bold.ttf");
//	data = loadJSON(url);
}
function setup(){
	createCanvas(windowWidth,windowHeight);
	projects = [];
	lastupdated = millis();
	currentday = day();
	url = 'https://itp.nyu.edu/camp2017/api/projects_OfqSntpCAW.json';
//	url = 'projects.json';
	reloadJSON();

	t = 0;

	cgreen = color(143,179,71);
	cyellow = color(235,172,31);
	cwhite = color(249,249,244);
	cgray = color(52);

	offset  = 0;

	nfinished = 0;

	colors.push(color('#9E2328'));
	colors.push(color('#23779E'));
	colors.push(color('#239E8F'));
	colors.push(color('#94B8B3'));
	colors.push(color('#C5D330'));

	enabledi = 0;
	lastMillis = 0;

}

function draw(){
	background(cgray);

	fill(cwhite);
	noStroke();
	textSize(60);
	textFont(fontCabinSketchRegular);
	text("ITP Camp Projects",20,100);

	textSize(20);
	text("Explore the projects with the mouse\nClick to see their page\n(Enable pop-ups for this page)",20,140);

	var A,B,phase,freq,x,y,d;
	var title,description,hover,alpha,enabled,c;
	var id;
	textSize(20);
	for(i in projects){
		A = projects[i].ellipseA;
		B = projects[i].ellipseB;
		phase = projects[i].ellipsePhase;
		freq = projects[i].ellipseFrequency;
		d = projects[i].ellipseDiameter;
		title = projects[i].name;
		alpha = projects[i].alpha;
		enabled = projects[i].enabled;
		c = projects[i].color;
		id = projects[i].id;
		x = A*cos(t*freq + phase) + width/2;
		y = B*sin(t*freq + phase) + height/2;

		fill(c,200);
		stroke(255);
		push();
		translate(x,y);
		ellipse(0,0,d,d);

		var withinDist = dist(mouseX,mouseY, x,y)<=d/2;
		if(withinDist || enabled){
			alpha+=1;

			fill(255,255,255,alpha);
			text(title,d/2,-d/2, width-x-100, 100);

			if(withinDist && mouseIsClicked){
				window.open("https://itp.nyu.edu/camp2017/project/"+id);
				mouseIsClicked = false;
			}
		}

		if(alpha>0){
			alpha--;
		}
		projects[i].alpha = alpha;
		pop();
	}



	t+=0.001;

	// Update
	if(millis()-lastupdated>1000*60){
		console.log("reloading");
		reloadJSON();
		lastupdated = millis();
	}

	if(millis()-lastMillis>1000*2){
		projects[enabledi].enabled = false;
		enabledi = floor(random(projects.length));
		projects[enabledi].enabled = true;

		lastMillis = millis();
	}


}

function mouseClicked(){
	mouseIsClicked = true;
}


function reloadJSON(){
	loadJSON(url,loadData);
	console.log("json reloaded");
}

function loadData(data){
	console.log("Loading data");
	var el;
	nfinished = 0;

	for(i in data){
		el = data[i];
		var project = [];
		if(el.enabled === "1" && el.final_show === "1"){
			project.id = el.id;
			project.name = el.name;
			project.description = el.description;
			project.users_in_project = el.users_in_project;


				var id = hasId(projects,el.id);
				console.log(id);
				if(id<0){
					project.ellipseA = random(50,height/2);
					project.ellipseB = project.ellipseA*0.75;
					project.ellipsePhase = random(0,2*PI);
					project.ellipseFrequency = random(0.1,4);
					var d = constrain(el.description.length * 0.05,15,50)
					project.ellipseDiameter = d;
					project.alpha = 0;
					project.enabled = false;
					project.color = random(colors);
					projects.push(project);
				}
				else{
					project.ellipseA = projects[id].ellipseA;
					project.ellipseB = projects[id].ellipseB;
					project.ellipsePhase = projects[id].ellipsePhase;
					project.ellipseFrequency = projects[id].ellipseFrequency;
					project.ellipseDiameter = projects[id].ellipseDiameter;
					project.alpha = projects[id].alpha;
					project.color = projects[id].color;
					project.enabled = projects[id].enabled;
					projects[id] = project;
				}
			}

	}



	console.log(projects);

}

function hasId(s, id){
	for(i in s){
		if(s[i].id == id){
			return i;
		}
	}
	return -1;

}


function windowResized(){
	resizeCanvas(windowWidth,windowHeight);
}
