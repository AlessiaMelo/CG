/**
 * Arquivo que possui funções de inicialização e render do objeto na cena.
 * Tudo que não é comentário de documentação e está comentado está mantido aqui para fins de testes
 * e utilização futura, não influindo em nada na presente entrega. Os autores não necessariamente
 * sabem o que eles fazem, por isso, favor ignorá-los.
 */

/*let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
let renderer = new THREE.WebGLRenderer();*/

let W = window.innerWidth;
let H = window.innerHeight;
let canvas;
let gl;
let arrPoints = [];
let thetaLoc;
let theta = [0, 180, 0];
let points;
let colors;
/**
 * Prepara o tamanho canvas e instancia um WebGL renderer nele.
 * Ajusta o viewport para a largura e altura do canvas. 
 * Compila os shaders e inicializa os atributos de cor e posições.
 * Recupera o ângulo theta para uso futuro na rotação.
 * Chama a função de render. 
 */
function init(){
    canvas = document.getElementById( "gl-canvas" );
    canvas.width = Math.min( W/4, H/4 ) * 3;
    canvas.height = canvas.width;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    let program = initShaders( gl, "vertexShader", "fragmentShader" );
    gl.useProgram( program );
    
    let cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    let vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    points.forEach(element => {
        arrPoints.push(element.toArray());
    });
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrPoints), gl.STATIC_DRAW );
    

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    render();
}

/**
 * Função que seta a uniform do ângulo do Vertex Shader para performar a rotação,
 * desenha as faces como triângulos e requisita um animation frame para renderizar o objeto na tela. 
 */
function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays( gl.TRIANGLES, 0, arrPoints.length );

    requestAnimFrame( render );
}

/*function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

function _init(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    let ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    let pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    camera.position.z = 250;
    camera.position.x = 100;
    camera.position.y = 75;
    scene.add( camera );

    window.addEventListener('resize', onWindowResize, false);

    let objLoader = new THREE.OBJLoader();
    objLoader.load('models/R2D2/R2D2.obj', function (mesh) {
        scene.add(mesh);
    });
    animate();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}*/