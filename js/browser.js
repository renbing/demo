var canvas;

function setMainLoop(func,interval)
{
	setInterval(func, interval);
}

$(document).ready(function() {

	canvas = $("#displaycanvas")[0];

	var ctx = canvas.getContext("2d");
	ctx.drawImageBatch = function(img, coords) {
		for( var i=0,max=coords.length;i<max;i++ )
		{
			var coord = coords[i];
			ctx.drawImage(img, coord[0], coord[1], coord[2], coord[3],
								coord[4], coord[5], coord[6], coord[7]);
			
		}
	}
	ctx.drawImageBatch2 = function(img, strCoords) {
		var coords = strCoords.split(",");
		for(var i=0,max=coords.length/8;i<max;i++)
		{
			this.drawImage(img, coords[i*8+0], coords[i*8+1], coords[i*8+2], coords[i*8+3],
								coords[i*8+4], coords[i*8+5], coords[i*8+6], coords[i*8+7]);
		}
	}

	documentReady();

});
