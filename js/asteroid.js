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
        });
    }

    return this;
}

module.exports = Asteroid;