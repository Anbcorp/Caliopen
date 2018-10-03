export const PI_PROPERTIES = ['comportment', 'technic', 'context'];
export const getPiClass = (pi) => {
  if (Number.isNaN(pi)) return 'disabled-pi';

  return pi <= 50 ? 'weak-pi' : 'strong-pi';
};
export const getAngles = () => {
  const piLength = PI_PROPERTIES.length;
  if (piLength === 0) {
    return 0;
  }

  return 360 / piLength;
};

export const getAveragePI = (pi) => {
  const piProps = PI_PROPERTIES;

  if (!pi) return NaN;

  return Math.round((piProps.reduce((acc, name) => acc + pi[name] || 0, 0)) / piProps.length);
};
