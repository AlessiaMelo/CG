/**
 * Esse é o arquivo que faz a mágica da primeira entrega,
 * nele vamos transformar os pontos de forma que eles fiquem com coordenadas em [-1,1],
 * permitindo sua vizualização no volume de visão do WebGL,
 * Isso será feito por meio de tranformações e para ajudar a realizá-las usamos a biblioteca Three.js
 * (E também pra já deixar a Three no trabalho porque vamos usá-la)
 */

let loader = new THREE.FileLoader();

/**
 * Essa função serve para encontrar o ponto mínimo e máximo 
 * dos vértices que compõe o objeto, note que não é o vértice mínimo ou máximo
 * e sim as coordenadas mínimas e máximas. A função e a key que você passa devem ser min
 * ou max dependendo do extremo que quer encontrar. Point é o ponto que deve ser testado para averiguar
 * se contem alguma coordenada extrema e o obj é o que mantem salva as atuais coordenadas extremas.
 * @param {object} obj 
 * @param {string} key 
 * @param {object} point 
 * @param {function} _function 
 */
function findExtremes(obj, key, point, _function){
    if(obj[key] === undefined){
        return obj[key] = point;
    }
    Object.keys(point).forEach((coord, value) =>{
        obj[key][coord] = _function(obj[key][coord], point[coord]);
    });
}
/**
 * Essa é a função que vai pegar o texto do arquivo obj lido e passado como data,
 * tratando-o e recuperando os itens do arquivo que são interessantes para essa fase do trabalho,
 * que no caso são vertices e faces.
 * Com isso, e com pontos mínimos e máximos definidos podemos realizar uma transformação
 * de escala em cada vértice para que os valores em suas coordenadas fiquem no intervalo [-1, 1]
 * por fim, uma malha de vértices é construida a partir do mapeamento de cada indice dado pelos elementos de face 
 * do .obj em seu respectivo vértice. 
 * @param {string} data 
 */
function _normalize(data){
    let vInfo = data.split('\n').reduce((current, line) => {
        line_parts = line.split(' ').map(content => content.split('/')[0]).filter(nonEmpty => nonEmpty != "");

        let _x = Number(line_parts[1]);
        let _y = Number(line_parts[2]);
        let _z = Number(line_parts[3]);

        if(line_parts[0] === 'v'){
            findExtremes(current, 'max', {x:_x, y:_y, z:_z}, Math.max);
            findExtremes(current, 'min', {x:_x, y:_y, z:_z}, Math.min);
            current.vertices.push(new THREE.Vector4(_x, _y, _z, 1));
        }
        if(line_parts[0] === 'f'){
            current.points.push(new THREE.Vector3(_x, _y, _z));
        }

        return current;
    }, {points : [], vertices : []});

    let maxVec = new THREE.Vector4(vInfo.max.x, vInfo.max.y, vInfo.max.z, 1);
    let minVec = new THREE.Vector4(vInfo.min.x, vInfo.min.y, vInfo.min.z, 1);
    let medianPoint = new THREE.Vector4().addVectors(maxVec, minVec).multiplyScalar(0.5);
    let scaling = 1.5 / (new THREE.Vector4().subVectors(maxVec, minVec).length());
    
    vInfo.vertices.forEach((value, index) => {
        vInfo.vertices[index].subVectors(value, medianPoint).multiplyScalar(scaling);
        vInfo.vertices[index].w = 1;
    });

    let mesh = [];
    vInfo.points.forEach((value) => {
        Object.keys(value).forEach(index => {
            mesh.push(vInfo.vertices[value[index]-1]);
        });
    });

    return mesh;
}

window.onload = () => {
    /**
     * Usa o loader para carregar o .obj
     * Chama a normalização para deixar os pontos no volume de visão.
     * Constrói um array de pontos de cor para coloração do objeto.
     * Chama init de init.js que vai fazer a mágica acontecer
     */
    loader.load("../models/NewTieFighter.obj", data => {
        points = _normalize(data);
        let size = 0.2 / points.length;
        let color = 0;
        colors = points.map(item => [ 0.83 - color, 0.82 - color, 0.65 - (color += size) - size, 1]);
        init();
    });	
}
