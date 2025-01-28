// game.js
// 管理烟花效果
// 创建一个烟花
function Firework( sx, sy, tx, ty ) {
	// 实际坐标
	this.x = sx;
	this.y = sy;
	// 起始坐标
	this.sx = sx;
	this.sy = sy;
	// 目标坐标
	this.tx = tx;
	this.ty = ty;
	// 从起点到目标的距离
	this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
	this.distanceTraveled = 0;
	// 跟踪每个烟花的过去坐标以创建轨迹效果，增加坐标数以创建更突出的轨迹
	this.coordinates = [];
	this.coordinateCount = 3;
	// 使用当前坐标填充初始坐标集合
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	this.angle = Math.atan2( ty - sy, tx - sx );
	this.speed = 2;
	this.acceleration = 1.02;
	this.brightness = random( 50, 70 );
	// 圆形目标指示器半径
	this.targetRadius = 1;
}

// 更新烟花
Firework.prototype.update = function( index ) {
	// 删除坐标数组中的最后一项
	this.coordinates.pop();
	// 将当前坐标添加到数组的开头
	this.coordinates.unshift( [ this.x, this.y ] );

	// 循环圆形目标指示器半径
	if( this.targetRadius < 8 ) {
		this.targetRadius += 0.3;
	} else {
		this.targetRadius = 1;
	}

	// 烟花加快
	this.speed *= this.acceleration;

	// 根据角度和速度获得当前速度
	var vx = Math.cos( this.angle ) * this.speed,
		vy = Math.sin( this.angle ) * this.speed;
	// 在施加速度的情况下，烟花会行进多远
	this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );

	// 如果行进的距离，包括速度，大于到目标的初始距离，那么目标已经到达
	if( this.distanceTraveled >= this.distanceToTarget ) {
		createParticles( this.tx, this.ty );
		// 删除烟花，使用传递到update函数的索引来确定要删除的
		fireworks.splice( index, 1 );
	} else {
		// 未达到目标，继续前进
		this.x += vx;
		this.y += vy;
	}
}

// 绘制烟花
Firework.prototype.draw = function() {
	ctx.beginPath();
	// 移动到集合中最后一个跟踪的坐标，然后在当前的x和y上画一条线
	ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
	ctx.lineTo( this.x, this.y );
	ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
	ctx.stroke();

	ctx.beginPath();
	// 用一个跳动的圆圈画出烟花的目标
	ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
	ctx.stroke();
}

// 创建颗粒
function Particle( x, y ) {
	this.x = x;
	this.y = y;
	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	// 在所有可能的方向上设置一个随机角度，单位为弧度
	this.angle = random( 0, Math.PI * 2 );
	this.speed = random( 5, 10 );
	// 摩擦力会使粒子减速
	this.friction = 0.97;
	// 将施加重力并将粒子拉下
	this.gravity = 1;
	// 将色调设置为整体色调变量的随机数+-20
	this.hue = random( hue - 20, hue + 20 );
	this.brightness = random( 50, 80 );
	this.alpha = 1;
	// 设定粒子淡出的速度
	this.decay = random( 0.015, 0.05 );
}

// 更新颗粒
Particle.prototype.update = function( index ) {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift( [ this.x, this.y ] );
	// slow down the particle
	this.speed *= this.friction;
	// apply velocity
	this.x += Math.cos( this.angle ) * this.speed;
	this.y += Math.sin( this.angle ) * this.speed + this.gravity;
	// fade out the particle
	this.alpha -= this.decay;

	// remove the particle once the alpha is low enough, based on the passed in index
	if( this.alpha <= this.decay ) {
		particles.splice( index, 1 );
	}
}

// 绘制颗粒
Particle.prototype.draw = function() {
	ctx. beginPath();
	// 移动到集合中最后一个跟踪的坐标，然后在当前的x和y上画一条线
	ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
	ctx.lineTo( this.x, this.y );
	ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
	ctx.stroke();
}

// 创建爆炸粒子组
function createParticles( x, y ) {
	// 增加粒子数以获得更大的爆炸，但要注意增加的粒子对画布性能的影响
	var particleCount = 30;
	while( particleCount-- ) {
		particles.push( new Particle( x, y ) );
	}
}

// 主程序
function loop() {
	// 该函数将与requestAnimationFrame一起无休止地运行
	requestAnimFrame( loop );

	// 随着时间的推移，增加色调以获得不同颜色的烟花
	hue += 0.5;

	// normally, clearRect() would be used to clear the canvas
	// we want to create a trailing effect though
	// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
	ctx.globalCompositeOperation = 'destination-out';
	// decrease the alpha property to create more prominent trails
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect( 0, 0, cw, ch );
	// change the composite operation back to our main mode
	// lighter creates bright highlight points as the fireworks and particles overlap each other
	ctx.globalCompositeOperation = 'lighter';

	// 每个烟花循环，绘制并更新
	var i = fireworks.length;
	while( i-- ) {
		fireworks[ i ].draw();
		fireworks[ i ].update( i );
	}

	// 每个粒子循环，绘制并更新
	var i = particles.length;
	while( i-- ) {
		particles[ i ].draw();
		particles[ i ].update( i );
	}

	// 鼠标未点击时，自动将烟花发射到随机坐标
	// if( timerTick >= timerTotal ) {
	// 	if( !mousedown ) {
	// 		// 在屏幕中间的底部启动烟花，然后设置随机目标坐标，随机y坐标将设置在屏幕上半部分的范围内
	// 		fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
	// 		timerTick = 0;
	// 	}
	// } else {
	// 	timerTick++;
	// }

	// 鼠标点击释放烟花
	// 限制鼠标放下时烟花发射的速度
	if( limiterTick >= limiterTotal ) {
		if( mousedown ) {
			// 在屏幕中间的底部启动焰火，然后将当前鼠标坐标设置为目标
			fireworks.push( new Firework( cw / 2, ch, mx, my ) );
			limiterTick = 0;
			ws.send(JSON.stringify({"type":"firework", "username":myname}));
		}
	} else {
		limiterTick++;
	}
}

// 鼠标事件

// 在mousemove上更新鼠标坐标
canvas.addEventListener( 'mousemove', function( e ) {
	mx = e.pageX - canvas.offsetLeft;
	my = e.pageY - canvas.offsetTop;
});

// 切换鼠标放下状态并阻止画布被选中
canvas.addEventListener( 'mousedown', function( e ) {
	e.preventDefault();
	mousedown = true;
});

canvas.addEventListener( 'mouseup', function( e ) {
	e.preventDefault();
	mousedown = false;
});

// 触摸事件

canvas.addEventListener( 'touchstart', function( e ) {
	mx = e.touches[0].pageX - canvas.offsetLeft;
	my = e.touches[0].pageY - canvas.offsetTop;
	console.log("touchstart");
	mousedown = true;
});

canvas.addEventListener( 'touchmove', function( e ) {
	e.preventDefault();
	mx = e.touches[0].pageX - canvas.offsetLeft;
	my = e.touches[0].pageY - canvas.offsetTop;
	mousedown = true;
	console.log("touchmove");
});

canvas.addEventListener( 'touchend', function( e ) {
	e.preventDefault();
	mousedown = false;
	console.log("touchend");
});


// 启动
window.onload = loop;