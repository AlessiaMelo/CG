let THREE = require('three');
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader';

var Millenium = function(){
    this.load = function(uniforms, vertexShader, fragmentShader, scene){
        let objLoader = new OBJLoader();
        let mtlLoader = new MTLLoader();

        mtlLoader.setPath('/models/millenium/');
        mtlLoader.load('millenium-falcon.mtl', materials => {
            materials.preload();
            console.log(materials);
            objLoader.setMaterials(materials);
            objLoader.setPath('/models/millenium/');
            objLoader.load('millenium-falcon.obj', obj => {
                /*let material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    //fragmentShader: fragmentShader
                });*/
                
                /*obj.traverse(child => {
                    child.material = material;
                });*/
                
                obj.scale.x = 0.2;
                obj.scale.y = 0.2;
                obj.scale.z = 0.2;

                obj.translateZ(500);
                //console.log(obj.position);
                scene.add(obj);
            }, 
            xhr => { //Progresso
                console.log((xhr.loaded / xhr.total * 100 ) + '% loaded');
            },
            error => {// Em caso de erros.
                console.log(error);
            });
        });

      
    }

    return this;
}

module.exports = Millenium;