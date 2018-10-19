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

const loginLink = document.getElementById('loginLink');
const pixelsDiv = document.getElementById('pixels');

let nbPixels;

let username;

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

if (document.cookie) {
  loginLink.setAttribute('href', '/disconnect');
  loginLink.innerHTML = 'Log out';
  username = getCookie('login');
} else {
  loginLink.setAttribute('href', 'https://github.com/login/oauth/authorize?client_id=4100c6839f33b3b4f29c');
  loginLink.innerHTML = 'Log in';
}

function changePixels(value) {
  pixelsDiv.innerHTML = `Pixels: ${value}`;
}

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
    if (nbPixels > 0) {
      nbPixels -= 1;
      changePixels(nbPixels);
      row = Math.floor(mouseGrid[1] / pixelOffset);
      column = Math.floor(mouseGrid[0] / pixelOffset);
      color = colorPick;
      array[row][column] = color;
      pixels.update(array);
      btnSave.innerHTML = 'Save';
      btnSave.style.backgroundColor = '#e7e7e7';
    }
  };

  btnSave.innerHTML = 'Save';
  btnSave.onclick = () => {
    request
      .post('/save')
      .send({
        _id: id,
        canvas: array,
        user: getCookie('user'),
        pixels: nbPixels
      })
      .type('application/json')
      .end((err, res) => {
        if (res.ok) {
          btnSave.innerHTML = 'Saved';
          btnSave.style.backgroundColor = 'green';
        }
      });
  };

  gridCanvas.style.fontSize = '3em';
  gridCanvas.innerHTML = repo.name;

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

function cleanElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  element.style.visibility = 'hidden';
}

const menuLeft = document.getElementById('menuLeft');

function searchPublicRepos(query) {
  request
    .get(`https://api.github.com/search/repositories?q=${query}&access_token=${getCookie('access_token')}`)
    .then((res) => {
      const publicRepos = res.body.items;
      cleanElement(menuLeft);
      menuLeft.style.visibility = 'visible';
      publicRepos.forEach((data) => {
        const div = document.createElement('div');
        const name = data.name;
        div.innerHTML = name;
        menuLeft.appendChild(div);
        div.onclick = () => {
          request
            .post('/repo')
            .send({ repos: data, userId: getCookie('user'), login: getCookie('login') })
            .type('application/json')
            .then((result) => {
              cleanElement(menuLeft);
              nbPixels = result.body.value;
              changePixels(nbPixels);
              showRepoCanvas(result.body.repo);
            });
        };
      });
    });
}

// Triggers public repos search when pressing enter key
const searchBar = document.getElementById('searchBar');
searchBar.onkeypress = (event) => {
  if (event.keyCode === 13) {
    searchPublicRepos(searchBar.value);
  }
};

searchBar.oninput = () => {
  while (menuLeft.firstChild) {
    menuLeft.removeChild(menuLeft.firstChild);
  }
  menuLeft.style.visibility = 'visible';
  request
    .get('/repos')
    .query({ text: searchBar.value })
    .then((res) => {
      res.body.forEach((data) => {
        const div = document.createElement('div');
        const name = data.name;
        div.innerHTML = name;
        menuLeft.appendChild(div);
        div.onclick = () => {
          request
            .post('/repo')
            .send({ repos: data, userId: getCookie('user'), login: getCookie('login') })
            .type('application/json')
            .then((result) => {
              cleanElement(menuLeft);
              nbPixels = result.body.value;
              changePixels(nbPixels);
              showRepoCanvas(result.body.repo);
            });
        };
      });
      const divMore = document.createElement('div');
      divMore.innerHTML = 'Search public repositories...';
      divMore.style.backgroundColor = '#cecdcd';
      menuLeft.appendChild(divMore);
      divMore.onclick = () => {
        searchPublicRepos(searchBar.value);
      };
    });
  if (searchBar.value === '') {
    cleanElement(menuLeft);
  }
};

module.exports = n => n * 111;
