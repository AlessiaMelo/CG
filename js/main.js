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
scene.add(camera);
//shipGroup.add( camera );

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
	ship.name = 'falcon';
	ship.hp = 100;
	shipGroup.add(ship);
	scene.add( shipGroup );
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
let cameraPosition = 0;
let movSpeed = 0.5;
let routeOffset = 50;

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
let fireTexture = new THREE.TextureLoader().load('/models/explosion/explosion0012.png');
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
	//mixers.push( mesh.mixer );
	let action = mesh.mixer.clipAction( mesh.animations[ 0 ] );
	action.play();
	mesh.position.z = -10;
	mesh.scale.set(0.03, 0.03, 0.03)
	mesh.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material= customExplosionMaterial;
			}
		});
	explosion = mesh;
}, onProgress, onError)


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
	shotR.name = 'shot';
	scene.add(shotR);
	arrayShots.push(shotR);

	let shotL = laserBeam.object3d.clone();
	shotL.position.set(shipGroup.position.x - 0.5, shipGroup.position.y - 1, shipGroup.position.z - 15);
	shotL.name = 'shot';
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
	if(ship && meteorsType.length == 4){
		let meteorType = Math.randomRange(3, 0);	
		let newMeteor = meteorsType[meteorType].clone();
		let start = new THREE.Vector3(Math.randomRange(110, -110), shipGroup.position.y, -110);
		let controlPoint1 = new THREE.Vector3(Math.randomRange(110, -110) ,Math.randomRange(110, -110), -80);
		let controlPoint2 = new THREE.Vector3(Math.randomRange(110, -110) ,Math.randomRange(110, -110), -40);
		let end = shipGroup.position;
		newMeteor.path = meteorType == 2 ? new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end): new THREE.Line3(start, end);
		newMeteor.t = 0;
		newMeteor.type = meteorType;
		meteors.push(newMeteor);
		scene.add(newMeteor);
	}
}

let clock = new THREE.Clock();
setInterval(putMeteor,5000);
const render = function() {
	requestAnimationFrame( render );
	spacesphere.rotation.x -= backgroundRotationOffset;
	
	arrayShots.forEach((shot,index) => {
		if(shot.position.z > -257) {
			shot.position.z -= 5;
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

	meteors.forEach((meteor, index) => {
		if(meteor.t <= 1){
			meteor.t += 0.02;
			if(meteor.type != 2) 
				meteor.path.at(meteor.t, where); 
			else 
				meteor.path.getPoint(meteor.t, where);
			
			meteor.position.x = where.x;
			meteor.position.y = where.y;
			meteor.position.z = where.z;
			meteor.rotation.x += 0.07;
			meteor.rotation.y += 0.05;
		}
		else{
			meteors.splice(index, 1);
			scene.remove(meteor);
		}
	});

	//Colisao e calculos 
	if(ship != undefined && meteorsType.length == 4){
		ship.collider = new THREE.Box3().setFromObject(ship);
		meteors.forEach((meteor, index) => {
			meteor.collider = new THREE.Box3().setFromObject(meteor);
			arrayShots.forEach((shot, index) => {
				shot.collider = new THREE.Box3().setFromObject(shot);
				
			});
		});
	}
	if ( mixers.length > 0 ) {
		for ( var i = 0; i < mixers.length; i ++ ) {
			mixers[ i ].update( clock.getDelta() );
		}
	}

	renderer.render( scene, camera );
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('keyup', onKeyup, false);
window.addEventListener('keydown', onKeydown, false);
window.addEventListener('mousedown', onMouseDown, false);
render();
