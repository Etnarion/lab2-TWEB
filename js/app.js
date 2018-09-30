
var grid = require('pixel-grid');
var position = require('mouse-position')
var array = new Array(60);
for (var i = 0; i < array.length; i++) {
  array[i] = new Array(80);
  array[i].fill('#000');
}
var colors = new Array(4);
colors = [
  ['#0061ff', '#01af4d'], 
  ['#fffa00', '#d10092'],
  ['#d2a30', '#d1af92'],
  ['#26af0', '#ffaa32'],
  ['#4f4a00', '#d1f292'],
  ['#df6200', '#d154092']
]

const size = 9.5;
const padding = 0.5;
const pixelOffset = size + padding;

var pixels = grid(array, {
  size: size,
  padding: padding
})

var colorPicker = grid(colors, {
  size: 40,
  padding: 1
})

var mouseGrid = position(pixels.canvas)

var row, column, color
var colorPick = '#000'

pixels.canvas.onclick = function(event){
  row = Math.floor(mouseGrid[1] / pixelOffset)
  column = Math.floor(mouseGrid[0] / pixelOffset)
  color = colorPick
  array[row][column] = color
  pixels.update(array)
};



mouseColor = position(colorPicker.canvas)

colorPicker.canvas.onclick = function(event) {
  row = Math.floor(mouseColor[1] / 41)
  column = Math.floor(mouseColor[0] / 41)
  colorPick = colors[row][column]
}

document.getElementById("btnSave").onclick = function(event) {
  //export grid as file
  alert("Hallo");
}

document.getElementById("grid").appendChild(pixels.canvas)
document.getElementById("grid").appendChild(colorPicker.canvas)

module.exports = function (n) { return n * 111 }