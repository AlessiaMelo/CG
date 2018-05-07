let THREE = require('three');
let OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var Falcon = function(){
    this.load = function(url, manager, scene){
        let loader = new THREE.OBJLoader(manager);
        loader.crossOrigin = '*';

        loader.load(url, (obj) => {
            scene.add(obj);
        })
    }

    return this;
}

module.exports = Falcon;