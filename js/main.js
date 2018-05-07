let THREE = require('three')
let Falcon = require('./falcon');
let OBJLoader = require('three-obj-loader');
OBJLoader(THREE);


// Converts from degrees to radians.
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

let scene = new THREE.Scene();
let far = 1000;
let near = 1;
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
let renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

let pointLight = new THREE.PointLight( 0xffffff, 0.8 );
camera.add( pointLight );
camera.position.z = 45;
camera.position.x = 0;
camera.position.y = 0;
scene.add( camera );

window.addEventListener('resize', onWindowResize, false);

let tan = Math.tan(Math.radians(camera.getEffectiveFOV()));
let fpn = -((far + near)/(far - near));
let tfn = -((2 * far * near)/(far - near));
let customProjectionMatrix = new THREE.Matrix4();
customProjectionMatrix.set(1/(aspect * tan), 0, 0, 0,
							0, 1/tan, 0, 0,
							0, 0, fpn, tfn,
							0, 0, -1, 0);
let objLoader = new THREE.OBJLoader();
objLoader.load('../models/Asteroid.obj', function (obj) {
	let material = new THREE.ShaderMaterial( {
		uniforms: {
			scale: {type: 'f', value: 0.2},
			theta: {type: 'vec3', value: new THREE.Vector3(45, 90, 45)},
			customProjectionMatrix: {type:'mat4', value: customProjectionMatrix }
		},
		vertexShader: document.getElementById( 'vertex-shader' ).textContent,
		fragmentShader: document.getElementById( 'fragment-shader' ).textContent
	});
	obj.position.setZ(0);
	obj.traverse(function (child) {
	  child.material = material;
	});
	scene.add( obj );
});

objLoader.load('../models/NewTieFighter.obj', function (obj) {
	let material = new THREE.ShaderMaterial( {
		uniforms: {
			scale: {type: 'f', value: 1},
			theta: {type: 'vec3', value: new THREE.Vector3(0, 180, 60)},
			customProjectionMatrix: {type:'mat4', value: customProjectionMatrix }
		},
		vertexShader: document.getElementById( 'vertex-shader' ).textContent,
		fragmentShader: document.getElementById( 'fragment-shader' ).textContent
	});
	obj.position.setX(25)
	obj.position.setZ(0);
	obj.traverse(function (child) {
	  child.material = material;
	});
	scene.add( obj );
});

function render() {
    requestAnimationFrame( render );
	renderer.render( scene, camera );
}

render();


function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}