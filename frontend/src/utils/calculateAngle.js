// Функція для обчислення кута між трьома точками
export const calculateAngle = (A, B, C) => {
  const BAx = A.x - B.x;
  const BAy = A.y - B.y;

  const BCx = C.x - B.x;
  const BCy = C.y - B.y;

  const dotProduct = BAx * BCx + BAy * BCy;

  const magnitudeBA = Math.sqrt(BAx * BAx + BAy * BAy);
  const magnitudeBC = Math.sqrt(BCx * BCx + BCy * BCy);

  if (magnitudeBA === 0 || magnitudeBC === 0) {
    return 0;
  }

  let cosAngle = dotProduct / (magnitudeBA * magnitudeBC);

  if (cosAngle > 1) cosAngle = 1;
  if (cosAngle < -1) cosAngle = -1;

  const angleInRadians = Math.acos(cosAngle);
  const angleInDegrees = (angleInRadians * 180) / Math.PI;

  return Math.round(angleInDegrees);
};