let THREE = require('three');
let OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var Asteroid = function(){   

    this.load = (uniforms, vertexShader, fragmentShader, scene) => {
        let objLoader = new THREE.OBJLoader();
        objLoader.load('../models/Asteroid.obj', obj => {
            let material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
            obj.translateX(-80);
           
            obj.traverse(child => {
                child.material = material;
            });
             scene.add(obj);
        }, // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        });
    }

    return this;
}

module.exports = Asteroid;