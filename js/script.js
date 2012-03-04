var Ajax = {
	getJSON : function(url, post, callback)
		{
			var xmlhttp = new XMLHttpRequest;
			
			xmlhttp.onreadystatechange = function() {
				//trace("js statechange:" + xmlhttp + ":" + xmlhttp.readyState + ":" + xmlhttp.status);
				if( xmlhttp.readyState==4 && xmlhttp.status==200 )
				{
					//trace("get json:" + url);
					//trace(xmlhttp.responseText);
					var data = eval("(" + xmlhttp.responseText + ")");
					callback(data);
				}
			}
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}
};

var Global = {
	workDirectory : "work/",
	canvas : null,
	ctx : null,
	stage : null,
	assets : {
		// 库名,导出名字
		"test" :	["test"],
		"building" :["armorshopBuilding", "castleBuilding", "cityscene", "houseBuilding", 
						"storeBuilding", "trainingfieldBuilding", "barrackBuilding", 
						"churchBuilding", "prisonBuilding1", "prisonBuilding3", 
						"prisonBuilding5", "tavernBuilding", "weaponshopBuilding", 
						"front2", "front3", "front4", "knight", "trainingfield_soldier", 
						"barrack_soldier", "church_produce_sprite"
						],
		"NPC" :		["Npc03restDog", "Npc03walkDog", "Npc06restChicken", "Npc06walkChicken", 
						"Npc07standPeople", "Npc07walkPeople", "Npc09standPeople", "Npc09walkPeople", 
						"Npc11standPeople", "Npc11walkPeople", "Npc13standPeople", "Npc13walkPeople", 
						"Npc15standPeople", "Npc15walkPeople", "Npc19standPeople", "Npc19walkPeople", 
						"Npc21standPeople", "Npc21walkPeople", "Npc23standPeople", "Npc23walkPeople", 
						"Npc25standPeople", "Npc25walkPeople", "Npc27standPeople", "Npc27walkPeople", 
						"farmer", "npc_footman_rest", "npc_footman_walk", "npc_halberdier_rest", 
						"npc_halberdier_walk", "npc_huoqiangshou_rest", "npc_huoqiangshou_walk", 
						"npc_ranger_rest", "npc_ranger_walk", "npc_shaman_rest", "npc_shaman_walk"
						],
		"soldier" : ["archer_run", "archer_run_1", "archer_atk", "archer_hurt", 
						"armor_run", "armor_run_1", "armor_atk", "armor_hurt", 
						"cavalry_run", "cavalry_run_1", "cavalry_atk", "cavalry_hurt", 
						"crossbowman_run", "crossbowman_run_1", "crossbowman_atk", "crossbowman_hurt", 
						"dragoon_run", "dragoon_run_1", "dragoon_atk", "dragoon_hurt", 
						"footman_run", "footman_run_1", "footman_atk", "footman_hurt", 
						"halberdier_run", "halberdier_run_1", "halberdier_atk", "halberdier_hurt", 
						"magic_run", "magic_run_1", "magic_atk", "magic_hurt", 
						"military_band_run", "military_band_run_1", "military_band_atk", "military_band_hurt", 
						"priest_run", "priest_run_1", "priest_atk", "priest_hurt", 
						"ranger_run", "ranger_run_1", "ranger_atk", "ranger_hurt", 
						"rodelero_run", "rodelero_run_1", "rodelero_atk", "rodelero_hurt", 
						"spearman_run", "spearman_run_1", "spearman_atk", "spearman_hurt", 
						"spikeman_run", "spikeman_run_1", "spikeman_atk", "spikeman_hurt", 
						"throwing_axeman_run", "throwing_axeman_run_1", "throwing_axeman_atk", "throwing_axeman_hurt",
						"morale_particle_sprite"
					],
		"soldier_big" :	["axe_heerbann_run", "axe_heerbann_run_1", "axe_heerbann_atk", "axe_heerbann_hurt", 
						"catapult_run", "catapult_run_1", "catapult_atk", "catapult_hurt", 
						"cike_run", "cike_run_1", "cike_atk", "cike_hurt", 
						"grenadier_run", "grenadier_run_1", "grenadier_atk", "grenadier_hurt", 
						"huoqiangshou_run", "huoqiangshou_run_1", "huoqiangshou_atk", "huoqiangshou_hurt", 
						"lightning_mage_run", "lightning_mage_run_1", "lightning_mage_atk", "lightning_mage_hurt", 
						"mushi_run", "mushi_run_1", "mushi_atk", "mushi_hurt", 
						"scutaman_run", "scutaman_run_1", "scutaman_atk", "scutaman_hurt", 
						"shaman_run", "shaman_run_1", "shaman_atk", "shaman_hurt", 
						"shengqishi_run", "shengqishi_run_1", "shengqishi_atk", "shengqishi_hurt", 
						"tiejiache_run", "tiejiache_run_1", "tiejiache_atk", "tiejiache_hurt",
						"battle_skill_shooting"
					]
	}
};

var TextureManager =
{
	"loadingCount":0,
	"pool":{},
};

TextureManager.load = function(library)
{
	if( library in this.pool )
	{
		return;
	}

	this.pool[library] = {};

	var loader = this;
	
	this.loadingCount ++;
	var packConfigFile = Global.workDirectory + library + "/" + library + ".tp.json";
	Ajax.getJSON(packConfigFile, "", function(data) {
		loader.pool[library]["data"] = data["frames"];
		loader.loadingCount--;
	});
	
	this.loadingCount ++;
	var img = new Image;
	img.src = Global.workDirectory + library + "/" + library + ".png";
	img.onload = function() {
		loader.pool[library]["img"] = img;
		loader.loadingCount--;
	};
}

TextureManager.loadComplete = function()
{
	return ( this.loadingCount <= 0 );
}

TextureManager.free = function(library)
{
	if( library in this.pool )
	{
		delete this.pool[library];
	}
}

TextureManager.get = function(library)
{
	if( library in this.pool )
	{
		return this.pool[library];
	}

	return null;
}

var AssetManager = 
{
	"loadingCount":0,
	"pool":{},
};

AssetManager.load = function(library, linkName)
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
		this.pool[library][linkName] = {};
	}

	var configFile = Global.workDirectory + library + "/" + linkName + ".json";
	var loader = this;
	
	this.loadingCount ++;
	Ajax.getJSON(configFile, "", function(data) {
		loader.pool[library][linkName] = data;
		loader.loadingCount --;
	});

	// 加载TexturePacker打包图片以及配置文件
		
	TextureManager.load(library);
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

	this.textureConf = TextureManager.get(library);
	if( !this.textureConf )
	{
		return null;
	}


	var mcConf = this.pool[library][linkName];

	return this._createMovieClip(mcConf, linkName + "/");
}

AssetManager._createMovieClip = function(mcConf, path)
{
	if( mcConf.frames.length == 0 )
	{
		return this._createLeafMovieClip(mcConf, path);
	}

	var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);
	mcObj.x = mcConf.x;
	mcObj.y = mcConf.y;

	for( var i=1,max=mcConf.totalFrames; i<=max; i++ )
	{
		var framePath = path + i + "/";

		var frame = mcConf.frames[i-1];
		if( frame.length == 1 && frame[0] == "same" )
		{
			// 处理相同帧
			mcObj.frames[i] = mcObj.frames[i-1];
			mcObj.nextFrame();
			continue;
		}

		for( var j=0,len=frame.length; j<len; j++ )
		{
			var child = frame[j];
			if( child.type == "[object TextField]" )
			{
				continue;
			}
			else if( child.frames.length == 0 )
			{
				mcObj.addChild( this._createLeafMovieClip(child, framePath) );
			}
			else
			{
				mcObj.addChild( this._createMovieClip(child, framePath + child.id + "/") );
			}
		}

		mcObj.nextFrame();
	}

	return mcObj;
};

AssetManager._createLeafMovieClip = function(mcConf, path)
{
	var mcObj = new MovieClip(mcConf.id, mcConf.totalFrames);
	mcObj.x = mcConf.x;
	mcObj.y = mcConf.y;

	// 叶子节点,创建纹理
	for( var k=1,maxk=mcConf.totalFrames; k<=maxk; k++ )
	{
		var frameInfo = mcConf.framesInfo[k-1];
		
		var bSplit = false;
		var frameInfos = [frameInfo];
		if( frameInfo.length == 5 )
		{
			// 1张图片切成5张图片情况
			frameInfos = frameInfo;
			bSplit = true;
		}

		for( var i=0,maxi=frameInfos.length; i<maxi; i++ )
		{
			var imageFile = mcConf.id + "_" + k + ".png";
			if( bSplit )
			{
				imageFile = mcConf.id + "_" + k + "_" + i + ".png";
			}

			var textureInfo = this.textureConf.data[path+imageFile];
			if( !textureInfo )
			{
				//alert(path+imageFile);
				continue;
			}

			// TexturePacker压缩后信息格式 [x,y,w,h,offsetX,offsetY]
			if( textureInfo[2] <= 0 || textureInfo[3] <= 0 )
			{
				continue;
			}

			var sx = textureInfo[0];
			var sy = textureInfo[1]
			var sw = textureInfo[2]
			var sh = textureInfo[3]

			var dx = frameInfos[i][0] + textureInfo[4];
			var dy = frameInfos[i][1] + textureInfo[5];
			var dw = sw;
			var dh = sh;
			
			// 如果是有切分图并且包含x,y,w,h 4个值的信息
			if( bSplit && frameInfos[i].length == 4 )
			{
				dw = frameInfos[i][2];
				dh = frameInfos[i][3];
			}

			mcObj.addChild(new Texture(this.textureConf.img, sx, sy, sw, sh, dx, dy, dw, dh));
		}

		mcObj.nextFrame();
	}

	return mcObj;
}

/*
AssetManager._createMovieClip = function(frames, path, container)
{
	for( var i=1,max=frames.length; i<=max; i++ )
	{
		var newPath = path + i + "/";

		var frame = frames[i-1];
		if( frame.length == 1 && frame[0] == "same" )
		{
			// 处理相同帧
			container.frames[i] = container.frames[i-1];
			container.nextFrame();
			continue;
		}

		for( var j=0,len=frame.length; j<len; j++ )
		{
			var child = frame[j];
			if( child.type == "[object TextField]" )
			{
				continue;
			}

			var childMC = new MovieClip(child.id, child.totalFrames);
			childMC.x = child.x;
			childMC.y = child.y;

			if( child.frames.length == 0 )
			{
				// 到达分析树叶子节点,直接读取图片纹理

				for( var k=1; k<=child.totalFrames; k++ )
				{
					var imageFile = child.id + "_" + k + ".png";

					var textureInfo = this.textureConf.data[newPath+imageFile];
					if( !textureInfo )
					{
						alert(newPath+imageFile);
						continue;
					}
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

					childMC.nextFrame();
				}
			}
			else
			{
				this._createMovieClip(child.frames, newPath + child.id + "/", childMC);
			}

			container.addChild(childMC);
		}

		container.nextFrame();
	}
};
*/

var Texture = function(img, sx, sy, sw, sh, dx, dy, dw, dh)
{
	this.visible = true;

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
	if( !this.visible )
	{
		return;
	}

	//Global.ctx.render(this.img, this.sx, this.sy, this.sw, this.sh, this.dx+dx, this.dy+dy, this.dw, this.dh);
	Global.ctx.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, this.dx+dx, this.dy+dy, this.dw, this.dh);
}

Texture.prototype.touch = function(e, dx, dy)
{
	var x = e.layerX;
	var y = e.layerY;
	if( (this.dy+dy <= y) && (y <= this.dy+dy+this.dh) && (this.dx+dx <= x) && (x <= this.dx+dx+this.dw) )
	{
		return true;
	}

	return false;
}

var MovieClip = function(name, frameCount)
{
	this.name = name;
	this.totalFrames = 1;
	if( frameCount )
	{
		this.totalFrames = frameCount;
	}
	this.currentFrame = 1;

	this.visible = true;
	this.stop = false;

	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scaleX = 1.0;
	this.scaleY = 1.0;
	this.numChildren = 0;
	
	this.frames = [];
	for( var i=0; i<=this.totalFrames; i++ )
	{
		this.frames.push([]);
	}
};

MovieClip.prototype.gotoAndStop = function(frameIndex)
{
	if( frameIndex <= 0 || frameIndex > this.totalFrames )
	{
		return;
	}

	this._goto(frameIndex, true);
}

MovieClip.prototype.gotoAndPlay = function(frameIndex)
{
	if( frameIndex <= 0 || frameIndex > this.totalFrames )
	{
		return;
	}

	this._goto(frameIndex, false);
}

MovieClip.prototype.stop = function()
{
	this.stop = true;
}

MovieClip.prototype.play = function()
{
	this.stop = false;
}

MovieClip.prototype.nextFrame = function()
{
	this._goto(this.currentFrame+1);
}

MovieClip.prototype.prevFrame = function()
{
	this._goto(this.currentFrame-1);
}

MovieClip.prototype._goto = function (frame, stop)
{
	if( frame < 1 )
	{
		this.currentFrame = this.totalFrames;
	}
	else if( frame > this.totalFrames )
	{
		this.currentFrame = 1;
	}
	else
	{
		this.currentFrame = frame;
	}
	
	if( arguments.length > 1 )
	{
		this.stop = stop;
	}

	this.numChildren = this.frames[this.currentFrame].length;
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
	
	var children = this.frames[this.currentFrame];
	for(var i=0,max=children.length; i<max; i++ )
	{
		children[i].render(this.matrix.dx, this.matrix.dy);;
	}
	
	this.matrix.pop(this.x, this.y);
	if( !this.stop )
	{
		this.nextFrame();
	}
};

MovieClip.prototype.touch = function(e)
{
	if( !this.visible )
	{
		return;
	}

	var touched = false;

	this.matrix.push(this.x, this.y);
	
	var children = this.frames[this.currentFrame];
	for(var i=children.length-1; i>=0; i-- )
	{
		touched = children[i].touch(e, this.matrix.dx, this.matrix.dy);;
		if( touched )
		{
			break;
		}
	}
	
	this.matrix.pop(this.x, this.y);

	if( touched && this.ontouch )
	{
		this.ontouch(e);
	}

	return touched;
};

MovieClip.prototype.ontouch = function()
{
	alert(this.name);
}

MovieClip.prototype.addChild = function(mc)
{
	if( mc instanceof MovieClip || mc instanceof Texture )
	{
		var children = this.frames[this.currentFrame];
		children.push(mc);
		return true;
	}

	return false;
};

MovieClip.prototype.getChildByName = function(name)
{
	var children = this.frames[this.currentFrame];
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
	var children = this.frames[this.currentFrame];
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

MovieClip.prototype.getChildAt = function(index)
{
	var children = this.frames[this.currentFrame];
	if( index < 0 || index >= children.length )
	{
		return null;
	}

	return children[index];
};

MovieClip.prototype.removeChildAt = function(index)
{
	var children = this.frames[this.currentFrame];
	if( index < 0 || index >= children.length )
	{
		return null;
	}

	var child = children[index];
	children.splice(index, 1);

	return child;
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
	Global.canvas = canvas;
	Global.ctx = canvas.getContext("2d");
	Global.ctx.fillStyle = "#ff0000";

	var stage = new MovieClip("stage");
	Global.stage = stage;

	for( var library in Global.assets )
	{
		var linkNames = Global.assets[library];

		for( var j=0;j<linkNames.length;j++ )
		{
			AssetManager.load(library, linkNames[j]);
		}
	}
	var timer = setInterval(function() {
		//trace("timer: " + AssetManager.loadingCount + "," + TextureManager.loadingCount);
		if( AssetManager.loadComplete() && TextureManager.loadComplete() )
		{
			clearInterval(timer);
			//trace("main");

			main();

			setMainLoop(function() {
				//Global.ctx.clearRect(0, 0, canvas.width, canvas.height);
				Global.ctx.fillRect(0, 0, canvas.width, canvas.height);
				
				Global.stage.render();

				//Global.ctx.cleanRender();
			}, 1000/60.0);
		}
	}, 1000);
}

function main()
{
	var stage = Global.stage;

	canvas.addEventListener("mousedown", mouseDownEvent, false);
	canvas.addEventListener("mousemove", mouseMoveEvent, false);
	canvas.addEventListener("mouseup", mouseUpEvent, false);
	
	var citySceneConf = [
		["castleBuilding",64,41],
	//	["marketBuilding",489.9,329.8],
		["barrackBuilding",932.9,171.8],
		["barrack_soldier",853,292],
		["knight", 640, 339],
		["prisonBuilding1",59.5,395.9],
		["prisonBuilding1",125,395.9],
		["prisonBuilding3",49,276],
		["prisonBuilding5",135,289],
		["trainingfieldBuilding",1104,83],
		["trainingfield_soldier",1144,248],
		["storeBuilding",1355.8,159.8],
		["weaponshopBuilding",1314.4,401.8],
		["armorshopBuilding",1145.4,388.9],
		["front2",845.8,280],
		["front3",575,335.4],
		["front4",820,305],
		["churchBuilding",1092.3,284.6],
		["church_produce_sprite",1090,275],
		["houseBuilding",220.9,355.8],
		["tavernBuilding",826,316.9]
	];

	var soldierConf =["archer", "armor", "cavalry", "crossbowman", "dragoon", "footman", "halberdier", 
						"magic", "military_band", "priest", "ranger", "rodelero", "spearman", "spikeman", 
						"throwing_axeman"];
	var soldierBigConf = ["axe_heerbann", "catapult", "cike", "grenadier", "huoqiangshou", "lightning_mage", 
						"mushi", "scutaman", "shaman", "shengqishi", "tiejiache"];

	var cityScene = AssetManager.createMovieClip("building", "cityscene");
	stage.addChild(cityScene);
	
	for( var i=0,max=citySceneConf.length; i<max; i++ )
	{
		var conf = citySceneConf[i];
		var linkName = conf[0];
		if( linkName == "tavernBuilding" )
		{
			for( var j=0,maxj=Global.assets.NPC.length; j<maxj; j++ )
			{
				var npc = AssetManager.createMovieClip("NPC", Global.assets.NPC[j]);
				npc.x = Math.round(Math.random() * 1400);
				npc.y = 450;

				cityScene.addChild(npc);
			}
		}

		var building = AssetManager.createMovieClip("building", linkName);
		building.x = conf[1];
		building.y = conf[2];
		cityScene.addChild(building);

		if( building.name.indexOf("prisonBuilding") === 0 || building.name == "knight" )
		{
			building.gotoAndStop(1);
		}
	}

	var soldierScene = new MovieClip("soilderScene", 1);
	soldierScene.visible = false;
	stage.addChild(soldierScene);
	
	var soldierStates = ["run", "run_1", "atk", "hurt"];
	for( var i=0,max=soldierConf.length; i<max; i++ )
	{
		var soldierName = soldierConf[i];
		for( var j=0,maxj=soldierStates.length; j<maxj; j++ )
		{
			var soilder = AssetManager.createMovieClip("soldier", soldierName + "_" + soldierStates[j]);
			soilder.x = (i%3*4+j)*120;
			soilder.y = 20 + (i-(i%3))/3 * 130;
			soldierScene.addChild(soilder);
		}
	}

	var soldierBigScene = new MovieClip("soilderBigScene", 1);
	soldierBigScene.visible = false;
	stage.addChild(soldierBigScene);
	
	for( var i=0,max=soldierBigConf.length; i<max; i++ )
	{
		var soldierName = soldierBigConf[i];
		for( var j=0,maxj=soldierStates.length; j<maxj; j++ )
		{
			var soilder = AssetManager.createMovieClip("soldier_big", soldierName + "_" + soldierStates[j]);
			soilder.x = (i%3*4+j)*120;
			soilder.y = 20 + (i-(i%3))/3 * 130;
			soldierBigScene.addChild(soilder);
		}
	}

	var test = AssetManager.createMovieClip("test", "test");
	test.visible = false;
	stage.addChild(test);
}

var lastMouseEvent = null;
var lastDisplayIndex = 0;
function mouseDownEvent(e)
{
	lastMouseEvent = e;	
	if( e.offsetX <= 100 && e.offsetY <= 100 )
	{
		lastDisplayIndex++;
		if( lastDisplayIndex >= Global.stage.numChildren )
		{
			lastDisplayIndex = 0;
		}

		for( var i=0,max=Global.stage.numChildren; i<max; i++ )
		{
			Global.stage.getChildAt(i).visible = false;
		}
		Global.stage.getChildAt(lastDisplayIndex).visible = true;
	}
}

function mouseMoveEvent(e)
{
	if( !lastMouseEvent )
	{
		return;
	}

	var x = e.offsetX - lastMouseEvent.offsetX;
	var y = e.offsetY - lastMouseEvent.offsetY;

	if( Global.stage.x < -550 && x < 0 )
	{
		return;
	}
	if(  Global.stage.x >0 && x > 0 )
	{
		return;
	}

	Global.stage.x += x;
	//Global.stage.y += y;

	lastMouseEvent = e;
}

function mouseUpEvent(e)
{
	lastMouseEvent = null;
}
