const grid = require('pixel-grid');
const position = require('mouse-position');
const request = require('superagent');
const ColorPicker = require('a-color-picker');

let array;
let id;

const size = 4.8;
const padding = 0.2;
const pixelOffset = size + padding;

let pixels;

let row;
let column;
let color;
let colorPick = '#fff';

function showRepoCanvas(repo) {
  // clears current grid
  const gridArea = document.getElementById('gridArea');
  while (gridArea.firstChild) {
    gridArea.removeChild(gridArea.firstChild);
  }

  const gridDiv = document.createElement('div');
  const colorsDiv = document.createElement('div');
  const gridCanvas = document.createElement('div');
  const btnSave = document.createElement('button');

  btnSave.style.backgroundColor = '#e7e7e7';

  // set array and id
  id = repo._id;
  array = repo.canvas;

  pixels = grid(array, {
    size,
    padding,
    background: '#d8d8d8',
  });

  const mouseGrid = position(pixels.canvas);

  pixels.canvas.onclick = () => {
    row = Math.floor(mouseGrid[1] / pixelOffset);
    column = Math.floor(mouseGrid[0] / pixelOffset);
    color = colorPick;
    array[row][column] = color;
    pixels.update(array);
    btnSave.innerHTML = 'Save';
    btnSave.style.backgroundColor = '#e7e7e7';
  };

  btnSave.innerHTML = 'Save';
  btnSave.onclick = () => {
    request
      .post('/save')
      .send({ _id: id, canvas: array })
      .type('application/json')
      .end((err, res) => {
        if (res.ok) {
          btnSave.innerHTML = 'Saved';
          btnSave.style.backgroundColor = 'green';
        }
      });
  };

  gridDiv.appendChild(gridCanvas);
  gridArea.appendChild(gridDiv);
  gridDiv.appendChild(btnSave);
  gridArea.appendChild(colorsDiv);
  gridCanvas.appendChild(pixels.canvas);

  ColorPicker.createPicker(colorsDiv)
    .onchange = (picker) => {
      colorPick = picker.color;
    };
}
request
  .get('https://api.github.com/users/Etnarion/repos')
  .then((res) => {
    res.body.forEach((data) => {
      const div = document.createElement('div');
      const name = data.name;
      div.innerHTML = data.name;
      document.getElementById('menuLeft').appendChild(div);
      div.onclick = () => {
        request
          .post('/repo')
          .send({ name })
          .type('application/json')
          .end((error, result) => {
            showRepoCanvas(result.body);
          });
      };
    });
  });

module.exports = n => n * 111;
