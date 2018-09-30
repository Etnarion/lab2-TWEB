
var grid = require('pixel-grid');
var position = require('mouse-position')
var array = new Array(60);
for (var i = 0; i < array.length; i++) {
  array[i] = new Array(80);
  array[i].fill('#000');
}
var colors = new Array(4);
colors = [['#0061ff', '#01af4d'], ['#fffa00', '#d10092']]
var pixels = grid(array, {
  size: 9.5,
  padding: 0.5
})

var colorPicker = grid(colors, {
  size: 40,
  padding: 1
})

var mouseGrid = position(pixels.canvas)

var row, column, color
var colorPick = '#000'

pixels.canvas.onclick = function(event){
  row = Math.floor(mouseGrid[1] / 10)
  column = Math.floor(mouseGrid[0] / 10)
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

document.body.appendChild(pixels.canvas)
document.body.appendChild(colorPicker.canvas)

module.exports = function (n) { return n * 111 }