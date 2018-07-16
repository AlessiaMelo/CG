
// Converte graus para radianos.
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};
// Converte radianos para graus.
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};
// Devolve um número aleatório dentro de um intervalo.
Math.randomRange = function(max, min){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
