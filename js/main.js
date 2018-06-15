//Loaders	
let objLoader = new THREE.OBJLoader();
let mtlLoader = new THREE.MTLLoader();

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
let pointLight = new THREE.PointLight( 0xffffff, 0.6 );
camera.add( pointLight );
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
var spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);

spacesphere.material.side = THREE.DoubleSide;  
spacesphere.material.map.wrapS = THREE.RepeatWrapping; 
spacesphere.material.map.wrapT = THREE.RepeatWrapping;
//spacesphere.material.map.offset.set( 0, 0 );
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
	shipGroup.add(ship);
	scene.add( shipGroup );
} );
var shipLoader = new THREE.ColladaLoader( shipLoadingManager );
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
let cameraPosition = 0;
let movSpeed = 0.5;
let routeOffset = 50;

//Meteoros
let bigMeteor;
let BigMeteorTexture = new THREE.TextureLoader().load('/models/meteors/asteroid/Object001_2015-02-06_14-35-47_complete.rpf_converted.jpg'); 
var loader = new THREE.OBJLoader();
loader.load( 'models/meteors/asteroid/asteroid.obj', function ( mesh ) {
	let material = new THREE.MeshStandardMaterial({
		map : BigMeteorTexture
	});
	mesh.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material.map = BigMeteorTexture;
		}
	});
	mesh.scale.set(0.1, 0.1, 0.1);
	bigMeteor = mesh;
}, onProgress, onError);

const onKeydown = function(event){
	switch(event.keyCode){
		case 87:
			if(shipGroup.position.y < routeOffset)
				shipGroup.position.y += movSpeed;
			else
				console.log("volte para a rota");
		break;
		case 68:
			if(shipGroup.position.x < routeOffset)
				shipGroup.position.x += movSpeed;
			else
				console.log("volte para a rota");
		break;
		case 83:
			if(shipGroup.position.y > -routeOffset)
				shipGroup.position.y -= movSpeed;
			else
				console.log("volte para a rota");
		break;
		case 65:
			if(shipGroup.position.x > -routeOffset)
				shipGroup.position.x -= movSpeed;
			else
				console.log("volte para a rota");
		break;
		case 81:
			if(shipGroup.position.z > -routeOffset)
				shipGroup.position.z -= movSpeed;
			else
				console.log("volte para a rota");
		break;
		case 69:
			if(shipGroup.position.z < -5)
				shipGroup.position.z += movSpeed;
			else
				console.log("volte para a rota");
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

let blink = 0;
const onMouseDown = function(){
	shotEffectR.position.set(shipGroup.position.x + 0.5, shipGroup.position.y - 0.5, shipGroup.position.z - 15);
	shotEffectL.position.set(shipGroup.position.x - 0.5, shipGroup.position.y - 0.5, shipGroup.position.z - 15);
	blink = 0;

	let shotR = laserBeam.object3d.clone();
	shotR.position.set(shipGroup.position.x + 0.5, shipGroup.position.y - 1, shipGroup.position.z - 15);
	scene.add(shotR);
	arrayShots.push(shotR);
	let shotL = laserBeam.object3d.clone();
	shotL.position.set(shipGroup.position.x - 0.5, shipGroup.position.y - 1, shipGroup.position.z - 15);
	scene.add(shotL);
	arrayShots.push(shotL);
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
	if(ship && bigMeteor){	
		let newMeteor = bigMeteor.clone();
		let start = new THREE.Vector3(Math.randomRange(110, -110) ,Math.randomRange(110, -110), -110);
		let end = ship.position;
		newMeteor.path = new THREE.Line3(start, end);
		newMeteor.t = 0;
		meteors.push(newMeteor);
		scene.add(newMeteor);
	}
}

setInterval(putMeteor, 1500);
const render = function() {
	requestAnimationFrame( render );
	spacesphere.rotation.x -= backgroundRotationOffset;
	
	arrayShots.forEach((shot,index) => {
		if(shot.position.z < 257) 
			shot.position.z -= 5;
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

	meteors.forEach((meteor, index) => {
		if(meteor.t <= 1.2){
			meteor.t += 0.005;
			meteor.path.at(meteor.t, where);
			meteor.position.x = where.x;
			meteor.position.y = where.y;
			meteor.position.z = where.z;
			meteor.rotation.x += 0.05;
			meteor.rotation.y += 0.03;
		}
		else{
			meteors.splice(index, 1);
			scene.remove(meteor);
		}
	});
	
	renderer.render( scene, camera );
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keyup', onKeyup, false);
window.addEventListener('keydown', onKeydown, false);
window.addEventListener('mousedown', onMouseDown, false);
render();
