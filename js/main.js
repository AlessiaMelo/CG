let textCount = 0;
let playing = false;
let score = 0;
let cameraPosition = 0;

$("#skipBtn").click(function(){
	som.pause();
	document.getElementById("title").style = "animation-iteration-count: 0";
	document.getElementById("skipBtn").style.display = "none";
	textCount = 800;
});

$("#playAgainBtn").click(function(){	
	document.getElementById("playAgainBtn").style.display = "none";
	document.getElementById("gameOverInfo").style.display = "none";
	window.addEventListener('mousedown', onMouseDown, false);
	imperialSound.pause();  
	textCount = 800;
	score = 0;
	shipGroup.add(ship);	
	mixers[0].stopAllAction();
	scene.remove(explodeMeteor);
	ship.hp = 100;
	document.getElementById("hp").innerHTML = "HP: " + ship.hp;

	if (cameraPosition === 0 )
	{
		shipGroup.add(engineCylinder);		
	}
	else{
		shipGroup.add(engineSphere);
	}


});


let shipGroup = new THREE.Group();


const onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
	}
};
const onError = function ( xhr ) { console.log(xhr) };

//Cena
let scene = new THREE.Scene();
let far = 2000;
let near = 0.1;
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(45, aspect, near, far);
let renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

let pointLight = new THREE.PointLight(0xeeeeee)
pointLight.position.set(0,0,0);
pointLight.ambient = new THREE.Vector3(1.0, 1.0, 1.0);
pointLight.diffuse = new THREE.Vector3(1.0, 1.0, 1.0);
pointLight.specular = new THREE.Vector3(1.0, 1.0, 1.0);
camera.add( pointLight );
//scene.add(camera);
shipGroup.add( camera );


//Matriz de projeção customizada.
let tan = Math.tan(Math.radians(camera.getEffectiveFOV()));
let fpn = -((far + near)/(far - near));
let tfn = -((2 * far * near)/(far - near));
let customProjectionMatrix = new THREE.Matrix4();
customProjectionMatrix.set(1/(aspect * tan), 0, 0, 0,
							0, 1/tan, 0, 0,
							0, 0, fpn, tfn,
							0, 0, -1, 0);

//Shaders customizados.
let vertexShader = document.getElementById( 'vertex-shader' ).textContent;
let fragmentShader = document.getElementById( 'fragment-shader' ).textContent;

//Espaço
let spacetex = new THREE.TextureLoader().load( '/models/black.jpg' );
spacetex.magFilter = THREE.NearestFilter;
spacetex.minFilter = THREE.LinearMipMapLinearFilter;
let spacesphereMat = new THREE.MeshPhongMaterial({
   color: 0xffffff,
   specular:0x111111,
   shininess: 3,
   map:spacetex
});
let spacesphereGeo = new THREE.SphereGeometry( 256, 64, 64 );
let spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);
spacesphere.material.side = THREE.DoubleSide;  
spacesphere.material.map.wrapS = THREE.RepeatWrapping; 
spacesphere.material.map.wrapT = THREE.RepeatWrapping;
spacesphere.material.map.repeat.set( 2, 3);
scene.add(spacesphere);

let ship;
let shipScale = 0.3;
// Millennium Falcon 
let shipLoadingManager = new THREE.LoadingManager( function() {
	ship.rotation.z = Math.radians(180);
	ship.scale.x *= shipScale;
	ship.scale.y *= shipScale;
	ship.scale.z *= shipScale;		
	ship.position.z = -15;
	ship.position.x = 0;
	ship.position.y = 0;
	ship.name = 'falcon';
	ship.hp = 100;
	shipGroup.add(ship);
	scene.add( shipGroup );
	window.addEventListener('mousedown', onMouseDown, false);
});
let shipLoader = new THREE.ColladaLoader( shipLoadingManager );
shipLoader.load('/models/Falcon01/model.dae', function ( collada ) {
	ship = collada.scene;
});

let customSphereMaterial = new THREE.ShaderMaterial({
	uniforms: {
		color: {type: "vec3", value: new THREE.Color(0x1E90FF)}
	},
	vertexShader:   document.getElementById('vertex-shader').textContent,
	fragmentShader: document.getElementById('fragment-shader').textContent,
	side: THREE.BackSide,
	blending: THREE.AdditiveBlending,
	transparent: true,
});
let customBoxMaterial = new THREE.ShaderMaterial({
	uniforms: {
		color: {type: "vec3", value: new THREE.Color(0x1E90FF)}
	},
	vertexShader:   document.getElementById('vertex-shader').textContent,
	fragmentShader: document.getElementById('fragment-shader').textContent,
	side: THREE.BackSide,
	blending: THREE.AdditiveBlending,
	transparent: true,
});
	
//Engine
let engineSphereGeometry = new THREE.SphereBufferGeometry(2.2, 16,16, Math.PI, Math.PI*2, 0, 0.5 * Math.PI)
let engineSphere = new THREE.Mesh( engineSphereGeometry, customSphereMaterial );
engineSphere.rotation.x = Math.radians(90);
engineSphere.position.z = -13.3;


let engineCylinderGeometry = new THREE.CylinderBufferGeometry( 2, 2, 0.15, 8, 1, true);
let engineCylinder = new THREE.Mesh(engineCylinderGeometry, customBoxMaterial);
engineCylinder.position.z = -10;
shipGroup.add(engineCylinder);

//Base dos tiros
let laserBeam	= new THREEx.LaserBeam()
laserBeam.object3d.scale.set(4, 4, 4);
laserBeam.object3d.rotation.y = Math.radians(90);
let arrayShots = [];

//Efeito do disparo
let shotTexture = new THREE.TextureLoader().load('/models/shot/orange_particle.png');
let shotMaterial = new THREE.SpriteMaterial({
	map: shotTexture,
	blending : THREE.AdditiveBlending,
});
let shotSprite = new THREE.Sprite(shotMaterial);

shotSprite.scale.set(2,2,2);
//Adicionar luz ao tiro;
let shotLight	= new THREE.PointLight(0xFFA500);
shotLight.intensity	= 0.5
shotLight.distance	= 4
shotLight.position.x= -0.05
shotSprite.add(shotLight)

let shotEffectR = shotSprite.clone();
shotEffectR.position.set(10, 10, 10);
scene.add(shotEffectR);

let shotEffectL = shotSprite.clone();
shotEffectL.position.set(10, 10, 10);
scene.add(shotEffectL);

let backgroundRotationOffset = 0.002;
let movSpeed = 2;
let routeOffset = 150;

//Ambient Audio
let listener = new THREE.AudioListener();
camera.add(listener);
let audioLoader = new THREE.AudioLoader();
let ambientAudio = new THREE.Audio(listener);
audioLoader.load( 'audio/ambient.ogg', function( buffer ) {
	ambientAudio.setBuffer(buffer);
	ambientAudio.setLoop(true);
	ambientAudio.setVolume(0.6);
});

//Meteoros
let meteorsType = [];
let bigMeteor;
let bigMeteorTexture = new THREE.TextureLoader().load('/models/meteors/asteroid/Object001_2015-02-06_14-35-47_complete.rpf_converted.jpg'); 
let biMeteorloader = new THREE.OBJLoader();

biMeteorloader.load( 'models/meteors/asteroid/asteroid.obj', function ( mesh ) {
	mesh.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material.map = bigMeteorTexture;
		}
	});

	mesh.scale.set(0.01, 0.01, 0.01);
	bigMeteor = mesh;
	bigMeteor.hp = 150;
	bigMeteor.name = 'meteor1';
	meteorsType.push(bigMeteor);
	document.getElementById("skipBtn").style.display = "block";	
}, onProgress, onError);

let meteorUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    {
      lightPosition: {
        type: "v3",
        value: pointLight.position
      }
    },
    {
      ambientProduct: {
        type: "v3",
        value: pointLight.ambient.multiply(new THREE.Vector3(0.4, 0.4, 0.4))
      }
    },
    {
      diffuseProduct: {
        type: "v3",
        value: pointLight.diffuse.multiply(new THREE.Vector3(0.3, 0.3, 0.3))
      }
    },
    {
      specularProduct: {
        type: "v3",
        value: pointLight.specular.multiply(new THREE.Vector3(0.6, 0.6, 0.6))
      }
    },
    {
      shininess: {
        type: "float",
        value: 100.0
      }
	},
  ])
let rockMeteor;
let rockMeteorLoader = new THREE.OBJLoader();
rockMeteorLoader.load( 'models/meteors/Rock/Rock.obj', function ( mesh ) {
	 let material = new THREE.ShaderMaterial({
	 	uniforms: meteorUniforms,
	 	vertexShader: document.getElementById('asteroid-vertex-shader').textContent,
	 	fragmentShader: document.getElementById('asteroid-fragment-shader').textContent,
	 	lights: true
	 })
	mesh.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	});
	rockMeteor = mesh;
	rockMeteor.hp = 15;
	rockMeteor.name = 'meteor2';
	rockMeteor.position.z = -10;
	rockMeteor.scale.set(2.5, 2.5, 2.5);
	//scene.add(rockMeteor)
	meteorsType.push(rockMeteor);
}, onProgress, onError);

let iceMeteor;
let iceMeteorTexture_1n = new THREE.TextureLoader().load('models/meteors/asteroid-01/textures/Asteroid_01_1n.png'); 
let iceMeteorTexture_alb = new THREE.TextureLoader().load('models/meteors/asteroid-01/textures/Asteroid_01_alb.png'); 
let iceMeteorTexture_ao = new THREE.TextureLoader().load('models/meteors/asteroid-01/textures/Asteroid_01_ao.png');
let asteroidVertexShader = document.getElementById( 'ice-asteroid-vertex-shader' ).textContent;
let asteroidFragmentShader = document.getElementById( 'ice-asteroid-fragment-shader' ).textContent; 

let iceMeteorMaterial = new THREE.ShaderMaterial({
	uniforms: {
		tOne: { type: "t", value: THREE.ImageUtils.loadTexture( "models/meteors/asteroid-01/textures/Asteroid_01_1n.png" ) },
		tThird: { type: "t", value: THREE.ImageUtils.loadTexture( "models/meteors/asteroid-01/textures/Asteroid_01_alb.png" ) },
		tSec: { type: "t", value: THREE.ImageUtils.loadTexture( "models/meteors/asteroid-01/textures/Asteroid_01_ao.png" ) }
	},
	vertexShader:   asteroidVertexShader,
	fragmentShader: asteroidFragmentShader,
});
let iceMeteorLoader = new THREE.FBXLoader();
iceMeteorLoader.load( 'models/meteors/asteroid-01/source/asteroid.fbx', function ( mesh ) {
	mesh.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = iceMeteorMaterial;
		}
	});
	mesh.scale.set(0.01, 0.01, 0.01)
	iceMeteor = mesh;
	iceMeteor.hp = 40;
	iceMeteor.name = 'meteor3';
 meteorsType.push(iceMeteor);
}, onProgress, onError);

//TIE Fighter
let tieFighter;
new THREE.TDSLoader().load('/models/tie_fighter/TF_3DS02.3ds', function( mesh ){
	mesh.scale.set(0.15, 0.15, 0.15);
	mesh.rotation.x = Math.radians(270);
	tieFighter = mesh;
	tieFighter.hp = 75;
	tieFighter.name = 'tie';
	meteorsType.push(tieFighter);
}, onProgress, onError);

//Explosão
let explosion;
let mixers = [];
let customExplosionMaterial = new THREE.ShaderMaterial({
	uniforms: {
		color: {type: "vec3", value: new THREE.Color(0xFDA50F)}
	},
	vertexShader:   document.getElementById('vertex-shader').textContent,
	fragmentShader: document.getElementById('fragment-shader').textContent,
	side: THREE.BackSide,
	blending: THREE.AdditiveBlending,
	transparent: true,
});
new THREE.FBXLoader().load('/models/explosion/Explosion.fbx', function(mesh){
	mesh.mixer = new THREE.AnimationMixer( mesh );
	mesh.mixer.timeScale = 2;
	mixers.push( mesh.mixer );
	mesh.position.z = -10;
	mesh.scale.set(0.3, 0.3, 0.3)
	mesh.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material= customExplosionMaterial;
			}
		});
	explosion = mesh;
}, onProgress, onError)

//Blast Sounds
let blasts = [];
let i
for(i = 0; i < 10; i++){
	blasts.push(new Audio('/audio/blast.mp3'))
	
}

let countUp = 0;
let countDown = 0;
let countLeft = 0;
let countRight = 0;
let rotationOffset = 0.0075
//Checar numero das teclas
const onKeydown = function(event){
	switch(event.keyCode){
		case 87:
			if(shipGroup.position.y < routeOffset){
				shipGroup.position.y += movSpeed;
				if(countUp < 10){
					ship.rotation.x += rotationOffset;
					engineCylinder.rotation.x -= 1.5 * rotationOffset
					engineSphere.rotation.x -= 1.5 * rotationOffset
					countUp +=1;
					countDown -=1;
				}
				document.getElementById("routeDiv").style.display = "none";
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
				
		break;
		case 68:
			if(shipGroup.position.x < routeOffset){
				shipGroup.position.x += movSpeed;
				if(countRight < 10){
					ship.rotation.z -= rotationOffset;
					engineSphere.rotation.z += 2.5 * rotationOffset
					countRight +=1;
					countLeft -=1;
					document.getElementById("routeDiv").style.display = "none";
				}
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
		break;
		case 83:
			if(shipGroup.position.y > -routeOffset){
				if(countDown < 10 ){
					ship.rotation.x -= rotationOffset;	
					engineCylinder.rotation.x += 1.5 * rotationOffset
					engineSphere.rotation.x += 1.5 * rotationOffset
					countUp -=1;
					countDown +=1;
				}
				shipGroup.position.y -= movSpeed;
				document.getElementById("routeDiv").style.display = "none";
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
		break;
		case 65:
			if(shipGroup.position.x > -routeOffset){
				shipGroup.position.x -= movSpeed;
				if(countLeft < 10){
					ship.rotation.z += rotationOffset;
					engineSphere.rotation.z -= 2.5 * rotationOffset
					countRight -=1;
					countLeft +=1;
				}
				document.getElementById("routeDiv").style.display = "none";
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
		break;
		case 81:
			if(shipGroup.position.z > -routeOffset)
			{
				shipGroup.position.z -= movSpeed;
			document.getElementById("routeDiv").style.display = "none";
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
		break;
		case 69:
			if(shipGroup.position.z < -5)
			{
				shipGroup.position.z += movSpeed;
				document.getElementById("routeDiv").style.display = "none";
			}
			else
			{
				document.getElementById("routeDiv").style.display = "inline-block";
			}
		break;
	}
}

const onKeyup = function(event){
	switch(event.keyCode){		
		case 32:
			if(cameraPosition === 0){
				camera.position.set(0, 35, 0);
				camera.lookAt(0,0, -40);
				camera.rotation.z = Math.radians(90);
				cameraPosition = 1;
				shipGroup.remove(engineCylinder);
				shipGroup.add(engineSphere);
			}
			else{
				camera.position.set(0,0,0);
				camera.lookAt(0,0, -1);
				camera.rotation.z = 0;
				cameraPosition = 0;
				shipGroup.add(engineCylinder);
				shipGroup.remove(engineSphere);
			}
		break;
	}
}
let recoil = 10;
let blink = 0;
let blastIndex = 0;
const onMouseDown = function(){
	if(recoil <= 5) return
	shotEffectR.position.set(shipGroup.position.x + 0.5, shipGroup.position.y - 0.5, shipGroup.position.z - 15);
	shotEffectL.position.set(shipGroup.position.x - 0.5, shipGroup.position.y - 0.5, shipGroup.position.z - 15);
	blink = 0;

	let shot = laserBeam.object3d.clone();
	let start = new THREE.Vector3(shipGroup.position.x + 0.5, shipGroup.position.y - 1, shipGroup.position.z -15);
	let end = new THREE.Vector3(shipGroup.position.x + 0.5, shipGroup.position.y - 1, -250);
	shot.path = new THREE.Line3(start, end);
	shot.t = 0;
	scene.add(shot);
	arrayShots.push(shot);
	
	shot = laserBeam.object3d.clone();
	start = new THREE.Vector3(shipGroup.position.x - 0.5, shipGroup.position.y - 1, shipGroup.position.z - 15);
	end = new THREE.Vector3(shipGroup.position.x - 0.5, shipGroup.position.y - 1, -250);
	shot.path = new THREE.Line3(start, end);
	shot.t = 0;
	scene.add(shot);
	arrayShots.push(shot);
	blasts[blastIndex].volume = 0.2;
	blasts[blastIndex].play();
	blastIndex++;
	blastIndex %= blasts.length;

	recoil = 0;
}

const onWindowResize = function () {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

let meteors = [];
let where = new THREE.Vector3();
const putMeteor = function(){
	if(loaded()){
		let meteorType = Math.randomRange(3, 0);	
		let newMeteor = meteorsType[meteorType].clone();
		
		switch(meteorType)
		{
			case 0:
				newMeteor.hp = 15;
			break;
			case 1:
				newMeteor.hp = 70;
			break;
			case 2:
				newMeteor.hp = 1;
			break;
			case 3:
				newMeteor.hp = 500;
			break;
		}

		let start =  meteorType == 2 ? new THREE.Vector3(shipGroup.position.x, shipGroup.position.y, -60) : new THREE.Vector3(Math.randomRange(110, -110), shipGroup.position.y, -110)
		let controlPoint1 = new THREE.Vector3(Math.randomRange(50, -50) ,Math.randomRange(50, -50), -40);
		let controlPoint2 = new THREE.Vector3(Math.randomRange(50, -50) ,Math.randomRange(50, -50), -20);
		let end = shipGroup.position;
		newMeteor.path = meteorType == 2 ? new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end): new THREE.Line3(start, end);
		newMeteor.t = 0;
		newMeteor.type = meteorType;
		meteors.push(newMeteor);
		scene.add(newMeteor);
		console.log(newMeteor.type);
	}
}

const loaded = function(){
	if(ship != undefined && meteorsType.length == 4 && playing){
		return true
		
	}
	return false 
}
const tieShot = function(){
	if(loaded()){
		meteors.forEach((meteor, index) => {
			if(meteor.type == 2){
				let shot = laserBeam.object3d.clone()
				let start = meteor.position
				let end = new THREE.Vector3(shipGroup.position.x, shipGroup.position.y, shipGroup.position.z - 20)
				shot.path = new THREE.Line3(start, end);
				shot.t = 0;
				scene.add(shot);
				arrayShots.push(shot);
				blasts[blastIndex].volume = 0.1;
				blasts[blastIndex].play();
				blastIndex++;
				blastIndex %= blasts.length;
			}
		})
	}
}

let clock = new THREE.Clock();
setInterval(putMeteor,1000);
setInterval(tieShot, 1000)

const render = function() {
	requestAnimationFrame( render );
	spacesphere.rotation.x -= backgroundRotationOffset;
	
	arrayShots.forEach((shot,index) => {
		if(shot.t <= 1) {
			shot.t += 0.2
			shot.enemy = true;
			shot.path.at(shot.t, where); 
			shot.position.x = where.x;
			shot.position.y = where.y;
			shot.position.z = where.z;	
		}
		else{
			arrayShots.splice(index, 1);
			scene.remove(shot);
		}
	});

	if(++blink === 2){
		shotEffectR.position.set(10, 10, 10);
		shotEffectL.position.set(10, 10, 10);
		blink = 0;
	}
	//Colisao e calculos 
	if(loaded()){
		meteors.forEach((meteor, index) => {
			if(meteor.t <= 1 && meteor.type != 2){
				meteor.t += 0.01;
				meteor.path.at(meteor.t, where); 
				meteor.position.x = where.x;
				meteor.position.y = where.y;
				meteor.position.z = where.z;
				meteor.rotation.x += 0.007;
				meteor.rotation.y += 0.005;
			}
			else if(meteor.t <= 1 && meteor.type == 2){
				meteor.t += 0.002;
				meteor.path.getPoint(meteor.t, where)
				meteor.position.x = where.x;
				meteor.position.y = where.y;
				meteor.position.z = where.z;
				meteor.rotation.x += 0.005;
				meteor.rotation.y += 0.003;
			}
			else{
				meteors.splice(index, 1);
				scene.remove(meteor);
			}
		})	

		ship.collider = new THREE.Box3().setFromObject(ship);
		meteors.forEach((meteor, index) => {
			meteor.collider = new THREE.Box3().setFromObject(meteor);
			if(ship.collider.intersectsBox(meteor.collider)){
				switch (meteor.type){
					case 0:
						ship.hp -= 5;
						break;
					case 1:
						ship.hp -= 15;
						break;
					case 2:
						ship.hp -= 100;
						break;
					case 3:
						ship.hp -= 100;
						break;
				}
				document.getElementById("hp").innerHTML = "HP: " + ship.hp;
				meteors.splice(index, 1);
				scene.remove(meteor);
			}
			arrayShots.forEach((shot, indexShot) => {
				shot.collider = new THREE.Box3().setFromObject(shot);
				if(meteor.collider.intersectsBox(shot.collider) && !shot.enemy){
					meteor.hp -= 50;
					console.log(meteor.hp);
					arrayShots.splice(indexShot, 1);
					scene.remove(shot);
					if(meteor.hp <= 0){
						scene.remove(meteor);
						switch (meteor.type){
							case 0:
								score += 250;
								break;
							case 1:
								score += 500;
								break;
							case 2:
								score += 10000;
								break;
							case 3:
								score += 5000;
								break;
						}
						meteors.splice(index, 1);
					}
				}	

				if(ship.collider.intersectsBox(shot.collider) && shot.enemy){
					ship.hp -= 30;
					document.getElementById("hp").innerHTML = "HP: " + ship.hp;
					arrayShots.splice(indexShot, 1);
					scene.remove(shot);
				}	
			});

			if(ship.hp <= 0){
				shipGroup.remove(ship);
				shipGroup.remove(engineCylinder);
				shipGroup.remove(engineSphere);
				explodeMeteor = explosion;
				explodeMeteor.position.x =shipGroup.position.x
				explodeMeteor.position.y =shipGroup.position.y
				explodeMeteor.position.z =shipGroup.position.z - 15;
				let action = explodeMeteor.mixer.clipAction( explodeMeteor.animations[ 0 ] );
				action.play(explodeMeteor);
				scene.add(explodeMeteor);
				mixers.push( explodeMeteor.mixer );
				ambientAudio.pause();
				playing = false;
				meteors.forEach(function(element) {
					scene.remove(element);
				}, this);
				meteors = [];
				gameOver(score);
			}
		});
	}
	if (mixers.length > 0){
		for ( var i = 0; i < mixers.length; i ++ ) {
			mixers[ i ].update( clock.getDelta() );			
		}
	}	
	
	if(textCount == 800) 
	{
		ambientAudio.play();
		playing = true;		
	}	
	textCount++;
	recoil++;
	if(loaded() && playing )score++;
	document.getElementsByClassName("score")[0].innerHTML = score;
	renderer.render( scene, camera );
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keyup', onKeyup, false);
window.addEventListener('keydown', onKeydown, false);

render();
