
var data;
function preload(){
	var url = 'http://itp.nyu.edu/camp2017/api/sessions_OfqSntpCAW.json';
	data = loadJSON(url);
}
function setup(){
	console.log(data.length);

}

function draw(){


}
