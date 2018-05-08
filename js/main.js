
let THREE = require('three')
let Asteroid = require('./asteroid');
let TIE = require('./tie');

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
let camera = new THREE.PerspectiveCamera( 45, aspect, 1, 1000 );
let renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

let pointLight = new THREE.PointLight( 0xffffff, 0.8 );
camera.add( pointLight );
camera.position.z = 100;
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


let vertexShader = document.getElementById( 'vertex-shader' ).textContent;
let fragmentShader = document.getElementById( 'fragment-shader' ).textContent;


let asteroidUniforms = {
	scale: {type: 'f', value: 1.5},
	theta: {type: 'vec3', value: new THREE.Vector3(0, 120, 0)},
	customProjectionMatrix: {type:'mat4', value: customProjectionMatrix }
}

let tieUniforms = {
	scale: {type: 'f', value: 2.5},
	theta: {type: 'vec3', value: new THREE.Vector3(0, 0, 0)},
	customProjectionMatrix: {type:'mat4', value: customProjectionMatrix }
}

let tie = new TIE();
tie.load(tieUniforms, vertexShader, fragmentShader, scene);

let asteroid = new Asteroid();
asteroid.load(asteroidUniforms, vertexShader, fragmentShader, scene);

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