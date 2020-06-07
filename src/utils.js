import Chance from 'chance';
const chance = new Chance();

export function weightedRandomDistrib(peak, canvasCount) {
  var prob = [],
    seq = [];
  for (let i = 0; i < canvasCount; i++) {
    prob.push(Math.pow(canvasCount - Math.abs(peak - i), 3));
    seq.push(i);
  }
  return chance.weighted(seq, prob);
}

export function createBlankImageData(imageData, canvasCount) {
  const imageDataArray = [];
  for (let i = 0; i < canvasCount; i++) {
    let arr = new Uint8ClampedArray(imageData.data);
    for (let j = 0; j < arr.length; j++) {
      arr[j] = 0;
    }
    imageDataArray.push(arr);
  }
  return imageDataArray;
}

export default {
  weightedRandomDistrib,
  createBlankImageData
}
