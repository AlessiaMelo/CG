let THREE = require('three');
let OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var TIE = function(){   

    this.load = (uniforms, vertexShader, fragmentShader, scene) => {
        let objLoader = new THREE.OBJLoader();
        objLoader.load('/models/NewTieFighter.obj', obj => {
            let material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
            obj.translateX(35);
            obj.translateY(30);     
            obj.traverse(child => {
                child.material = material;
            });
             scene.add(obj);
        }, xhr => {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        }, error=>{
    
            console.log(error);
    
        });
    }

    return this;
}

module.exports = TIE;