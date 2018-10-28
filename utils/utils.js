function mergeCanvas(dbCanvas, changedCanvas, changedPixels) {
  const newArray = new Array(dbCanvas.length);
  for (let i = 0; i < dbCanvas.length; i++) {
    newArray[i] = new Array(dbCanvas[i].length);
  }
  for (let i = 0; i < dbCanvas.length; i++) {
    for (let j = 0; j < dbCanvas[i].length; j++) {
      if (changedPixels[i][j] === 1) {
        newArray[i][j] = changedCanvas[i][j];
      } else {
        newArray[i][j] = dbCanvas[i][j];
      }
    }
  }
  return newArray;
}

module.exports = {
  mergeCanvas,
};
