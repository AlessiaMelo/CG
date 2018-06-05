//Loaders	
let objLoader = new THREE.OBJLoader();
let mtlLoader = new THREE.MTLLoader();

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
scene.add( camera );

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
// let spacetex = new THREE.TextureLoader().load( '/models/black.jpg' );
// spacetex.magFilter = THREE.NearestFilter;
// spacetex.minFilter = THREE.LinearMipMapLinearFilter;
// let spacesphereMat = new THREE.MeshPhongMaterial({
//    color: 0xffffff,
//    specular:0x111111,
//    shininess: 3,
//    map:spacetex
// });
// let spacesphereGeo = new THREE.SphereGeometry( 64, 16, 16 );
// var spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);

// spacesphere.material.side = THREE.DoubleSide;  
// spacesphere.material.map.wrapS = THREE.RepeatWrapping; 
// spacesphere.material.map.wrapT = THREE.RepeatWrapping;
// //spacesphere.material.map.offset.set( 0, 0 );
// spacesphere.material.map.repeat.set( 2, 3);
  
// scene.add(spacesphere);



// Millennium Falcon 
let loadingManager = new THREE.LoadingManager( function() {
	ship.rotation.z = Math.radians(180);
	ship.position.z = -40;
	scene.add( ship );
} );
var loader = new THREE.ColladaLoader( loadingManager );
loader.load('/models/Falcon01/model.dae', function ( collada ) {
	ship = collada.scene;
});

const onWindowResize = function () {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const render = function() {
	requestAnimationFrame( render );
	//spacesphere.rotation.x += 0.002;
	renderer.render( scene, camera );
}

window.addEventListener('resize', onWindowResize, false);
render();
