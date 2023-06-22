export function getNumberAsLetter(number) {
  return String.fromCharCode(number + 65);
}

export function getLetterAsNumber(letter) {
  return letter.toUpperCase().charCodeAt(0) - 65;
}
