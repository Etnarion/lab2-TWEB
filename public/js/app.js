
var grid = require('pixel-grid');
var position = require('mouse-position')
const request = require('superagent');
var array;
var id;
var colors = new Array(4);
colors = [
  ['#0061ff', '#01af4d', '#fffa00', '#d10092', '#d2a30', '#d1af92', '#26af0', '#ffaa32', '#4f4a00', '#d1f292', '#df6200', '#d154092']
]

const size = 4.8;
const padding = 0.2;
const pixelOffset = size + padding;

var pixels;

var colorPicker = grid(colors, {
  size: 40,
  padding: 1
})

var row, column, color
var colorPick = '#fff'

colorPicker.canvas.onclick = function(event) {
  row = Math.floor(mouseColor[1] / 41)
  column = Math.floor(mouseColor[0] / 41)
  colorPick = colors[row][column]
}

request
  .get('https://api.github.com/users/Etnarion/repos')
  .then(res => {
    res.body.forEach((data) => {
      var div = document.createElement("div");
      var name = data.name;
      div.innerHTML = name;
      document.getElementById("menuLeft").appendChild(div);
      div.onclick = function(event){
        $.ajax({
          type: "POST",
          url: '/repo',
          data: JSON.stringify({name: name}),
          contentType: 'application/json',
          success: function(res) {
            console.log(res);
            showRepoCanvas(res);
          }
        })
      }
    });
  });

function showRepoCanvas(repo) {
  //clears current grid
  var gridArea = document.getElementById("gridArea");
  while (gridArea.firstChild) {
    gridArea.removeChild(gridArea.firstChild);
  }

  //set array and id
  id = repo._id;
  array = repo.canvas;

  pixels = grid(array, {
    size: size,
    padding: padding
  })

  var mouseGrid = position(pixels.canvas)

  pixels.canvas.onclick = function(event){
    row = Math.floor(mouseGrid[1] / pixelOffset)
    column = Math.floor(mouseGrid[0] / pixelOffset)
    color = colorPick
    array[row][column] = color
    pixels.update(array)
  };

  mouseColor = position(colorPicker.canvas)

  var gridCanvas = document.createElement("div");
  var colorPickerDom = document.createElement("div");
  gridCanvas.appendChild(pixels.canvas);
  colorPickerDom.appendChild(colorPicker.canvas);

  var btnSave = document.createElement("button");
  btnSave.innerHTML = "Save";
  btnSave.onclick = function(event) {
    $.ajax({
      type: "POST",
      url: '/save',
      data: JSON.stringify({ _id: id, canvas: array }),
      contentType: 'application/json',
    })
  }

  gridArea.appendChild(gridCanvas);
  gridArea.appendChild(colorPickerDom);
  gridArea.appendChild(btnSave);

}
module.exports = function (n) { return n * 111 }