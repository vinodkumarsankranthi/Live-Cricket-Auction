export const formatIndianNumber = (num) => {
  if (!num) return '';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(num));
};