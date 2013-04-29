var speed = 0;
var weight = 0;
var stime = 0;
var etime = 0;
var time = 0;
var calperhr = 0;
var distance = 0;
var speed = 0;

function calculate()
{
	weight = document.getElementById("lbs").value + 30;
	stime = document.getElementById("stime").value;
	etime = document.getElementById("etime").value;
	distance = document.getElementById("distance").value;
	time = etime - stime;
	speed = distance/time;
	calperhr = ((speed * weight*(.0053)+.0083*speed^3)*7.2)/10;
	elem = document.getElementById("status");
	//elem.innerHTML = calperhr;

console.log(speed);
console.log(calperhr);
}