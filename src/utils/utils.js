function getStringSpaceLength(str) {
  let length = 0;
  Array.from(str).map(function (char) {
    if (char.charCodeAt(0) > 255)
      length += 2;
    else
      length++;
  });
  return length;
}

function generateSpace(length) {
  let space = "";
  for (let i = 0; i < length; i++) {
    space += " ";
  }
  return space;
}

export {getStringSpaceLength, generateSpace};
