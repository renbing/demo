var Ajax = {
	getJSON : function(url, post, callback)
		{
			var xmlhttp = new XMLHttpRequest;
			
			xmlhttp.onreadystatechange = function() {
				if( xmlhttp.readyState==4 && xmlhttp.status==200 )
				{
					//alert(xmlhttp.responseText);
					var data = eval("(" + xmlhttp.responseText + ")");
					callback(data);
				}
			}
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}
};

var globalContext = null;

var Global = {
	workDirectory : "work/",
};

var TextureManager =
{
	"loadingCount":0,
	"pool":{},
};

TextureManager.load = function(packPath)
{
	if( packPath in this.pool )
	{
		return;
	}

	this.pool[packPath] = {};

	var loader = this;

	this.loadingCount ++;
	var packConfigFile = Global.workDirectory + packPath + ".tp.json";
	Ajax.getJSON(packConfigFile, "", function(data) {
		loader.pool[packPath]["data"] = data["frames"];
		loader.loadingCount--;
	});
	
	this.loadingCount ++;
	var img = new Image;
	img.src = Global.workDirectory + packPath + ".png";
	img.onload = function() {
		loader.pool[packPath]["img"] = img;
		loader.loadingCount--;
	};
}

TextureManager.loadComplete = function()
{
	return ( this.loadingCount <= 0 );
}

TextureManager.free = function(packPath)
{
	if( packPath in this.pool )
	{
		delete this.pool[packPath];
	}
}

TextureManager.get = function(packPath)
{
	if( packPath in this.pool )
	{
		return this.pool[packPath];
	}

	return null;
}

var AssetManager = 
{
	"loadingCount":0,
	"pool":{},
};

AssetManager.load = function(library, linkName, muti)
{
	// 加载导出名配置文件
	if( library in this.pool && linkName in this.pool[library] )
	{
		return;
	}

	if( !(library in this.pool) )
	{
		this.pool[library] = {};
	}

	if( !(linkName in this.pool[library]) )
	{
		this.pool[library][linkName] = {"muti":muti};
	}

	var configFile = Global.workDirectory + library + "/" + linkName + ".json";
	var loader = this;
	
	this.loadingCount ++;
	Ajax.getJSON(configFile, "", function(data) {
		loader.pool[library][linkName]["data"] = data;
		loader.loadingCount --;
	});

	// 加载TexturePacker打包图片以及配置文件
		
	var packPath = library + "/" + linkName;
	if( muti )
	{
		packPath = library;
	}

	TextureManager.load(packPath);
};

AssetManager.loadComplete = function()
{
	return ( this.loadingCount <= 0 );
}

AssetManager.free = function(library, linkName)
{
	if( !linkName )
	{
		if( library in this.pool )
		{
			delete this.pool[library];
		}
	}
	else
	{
		if( library in this.pool && linkName in this.pool[library] )
		{
			delete this.pool[library][linkName];
		}
	}
}

AssetManager.createMovieClip = function(library, linkName)
{
	if( !(library in this.pool) || !(linkName in this.pool[library]) )
	{
		return null;
	}

	var muti = this.pool[library][linkName]["muti"];

	var packPath = library + "/" + linkName;
	if( muti )
	{
		packPath = library;
	}

	this.textureConf = TextureManager.get(packPath);
	if( !this.textureConf )
	{
		return null;
	}


	var mcFrames = this.pool[library][linkName]["data"];
	this.library = library;
	this.linkName = linkName;
	
	var mainMC = new MovieClip(library + "." + linkName);
	
	if( muti )
	{
		this._createMovieClip(mcFrames, linkName + "/", mainMC);
	}
	else
	{
		this._createMovieClip(mcFrames, "", mainMC);
	}

	return mainMC;
}

AssetManager._createMovieClip = function(frames, path, container)
{
	for( var i=1,max=frames.length; i<=max; i++ )
	{
		container.gotoAndStop(i);
		var newPath = path + i + "/";

		var frame = frames[i-1];
		if( frame.length == 1 && frame[0] == "same" )
		{
			// 处理相同帧
			continue;
		}

		for( var j=0,len=frame.length; j<len; j++ )
		{
			var child = frame[j];
			if( child.type == "[object TextField]" )
			{
				continue;
			}

			var childMC = new MovieClip(child.id);
			childMC.x = child.x;
			childMC.y = child.y;

			if( child.frames.length == 0 )
			{
				// 到达分析树叶子节点,直接读取图片纹理
				for( var k=1; k<=child.totalFrames; k++ )
				{
					childMC.gotoAndStop(k);
					var imageFile = child.id + "_" + k + ".png";

					var textureInfo = this.textureConf.data[newPath+imageFile];
					if( textureInfo.frame.w <= 0 || textureInfo.frame.h <= 0 )
					{
						continue;
					}

					var sx = textureInfo.frame.x;
					var sy = textureInfo.frame.y;
					var sw = textureInfo.frame.w;
					var sh = textureInfo.frame.h;

					var dx = child.framesInfo[k-1][0] + textureInfo.spriteSourceSize.x;
					var dy = child.framesInfo[k-1][1] + textureInfo.spriteSourceSize.y;
					var dw = sw;
					var dh = sh;

					var texture = new Texture(this.textureConf.img, sx, sy, sw, sh, dx, dy, dw, dh);

					childMC.addChild(texture);
				}
			}
			else
			{
				this._createMovieClip(child.frames, newPath + child.id + "/", childMC);
			}

			container.addChild(childMC);
		}
	}
	container.gotoAndStop(1);
};

var Texture = function(img, sx, sy, sw, sh, dx, dy, dw, dh)
{
	this.img = img;
	this.sx = sx;
	this.sy = sy;
	this.sw = sw;
	this.sh = sh;
	this.dx = dx;
	this.dy = dy;
	this.dw = dw;
	this.dh = dh;
};

Texture.prototype.render = function(dx, dy)
{
	globalContext.render(this.img, this.sx, this.sy, this.sw, this.sh, this.dx+dx, this.dy+dy, this.dw, this.dh);
}

var MovieClip = function(name)
{
	this.name = name;
	this.frameCount = 1;
	this.frameCursor = 1;

	this.visible = true;

	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scaleX = 1.0;
	this.scaleY = 1.0;
	
	this.frames = [[],[]];
};

MovieClip.prototype.gotoAndStop = function(frameCursor)
{
	if( frameCursor <= 0 )
	{
		return;
	}

	if( frameCursor > this.frameCount )
	{
		// 跳到没有的帧，就自动添加
		for( var i=this.frameCount+1;i<=frameCursor; i++ )
		{
			this.frames[i] = [];
		}

		this.frameCount = frameCursor;
	}

	this.frameCursor = frameCursor;
}

MovieClip.prototype.nextFrame = function()
{
	if( this.frameCursor >= this.frameCount )
	{
		this.frameCursor = 1;
	}
	else
	{
		this.frameCursor++;
	}
}

MovieClip.prototype.matrix = 
{	
	"m11":1, 
	"m12":0, 
	"m21":0, 
	"m22":1, 
	"dx":0, 
	"dy":0,
	"push": function(dx, dy) {
		this.dx += dx;	
		this.dy += dy;
	},
	"pop": function(dx, dy) {
		this.dx -= dx;
		this.dy -= dy;
	}
};

MovieClip.prototype.render = function()
{
	if( !this.visible )
	{
		return;
	}

	this.matrix.push(this.x, this.y);
	
	var children = this.frames[this.frameCursor];
	for(var i=0,max=children.length; i<max; i++ )
	{
		children[i].render(this.matrix.dx, this.matrix.dy);;
	}
	
	this.matrix.pop(this.x, this.y);
	this.nextFrame();
};

MovieClip.prototype.addChild = function(mc)
{
	if( mc instanceof MovieClip || mc instanceof Texture )
	{
		var children = this.frames[this.frameCursor];
		children.push(mc);
		return true;
	}

	return false;
};

MovieClip.prototype.getChildByName = function(name)
{
	var children = this.frames[this.frameCursor];
	for(var i=0; i<children.length; i++ )
	{
		var child = children[i];
		if( child.name === name )
		{
			return child;
		}
	}

	return null;
};

MovieClip.prototype.removeChildByName = function(name)
{
	var children = this.frames[this.frameCursor];
	for(var i=0; i<children.length; i++ )
	{
		var child = children[i];
		if( child.name === name )
		{
			children.splice(i, 1);
			return child;
		}
	}

	return null;
};

CanvasRenderingContext2D.prototype.buf = {"img":null, "coords":[]};
CanvasRenderingContext2D.prototype.render = function(img, sx, sy, sw, sh, dx, dy, dw, dh)
{
	if( this.buf.img != null && this.buf.img != img )
	{
		this.drawImageBatch2(this.buf.img, this.buf.coords.join(","));
		this.buf.coords = [];
	}
	
	this.buf.coords.push(sx);
	this.buf.coords.push(sy);
	this.buf.coords.push(sw);
	this.buf.coords.push(sh);
	this.buf.coords.push(dx);
	this.buf.coords.push(dy);
	this.buf.coords.push(dw);
	this.buf.coords.push(dh);

	this.buf.img = img;
}

CanvasRenderingContext2D.prototype.cleanRender = function()
{
	if( this.buf.img && this.buf.coords.length > 0 )
	{
		this.drawImageBatch2(this.buf.img, this.buf.coords.join(","));
	}

	this.buf.img = null;
	this.buf.coords = [];
}

function documentReady()
{
	globalContext = canvas.getContext("2d");
	globalContext.fillStyle = "#ff0000";

	var assets = [
		// 库名,是否打包在一起,导出名字
		["home",false,["buildingTestWindow", "icon_home"]], 
		["shop",true,["common_tips", "goodsPanel", "shopPanel", "use_panel"]]
	];

	for( var i=0;i<assets.length;i++ )
	{
		var asset = assets[i];

		var library = asset[0];
		var muti = asset[1];
		var linkNames = asset[2];

		for( var j=0;j<linkNames.length;j++ )
		{
			AssetManager.load(library, linkNames[j], muti);
		}
	}

	var timer = setInterval(function() {
		if( AssetManager.loadComplete() && TextureManager.loadComplete() )
		{
			clearInterval(timer);

			var stage = new MovieClip("stage");

			var build = AssetManager.createMovieClip("home", "buildingTestWindow");
			stage.addChild(build);
			
			var shopPanel = AssetManager.createMovieClip("shop", "shopPanel");
			shopPanel.x = shopPanel.y = 100;
			stage.addChild(shopPanel);

			setMainLoop(function() {
				//globalContext.clearRect(0, 0, canvas.width, canvas.height);
				globalContext.fillRect(0, 0, canvas.width, canvas.height);
				
				stage.render();

				globalContext.cleanRender();
			}, 1000/60.0);
		}
	}, 100);
}
