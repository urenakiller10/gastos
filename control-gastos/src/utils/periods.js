function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClosestFriday(year, month, targetDay) {
  const targetDate = new Date(year, month, targetDay);

  let bestDate = null;
  let bestDiff = Infinity;

  for (let offset = -3; offset <= 3; offset++) {
    const candidate = new Date(year, month, targetDay + offset);

    if (candidate.getDay() === 5) {
      const diff = Math.abs(offset);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestDate = candidate;
      }
    }
  }

  return bestDate;
}

function getPayDatesAround(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const candidates = [
    getClosestFriday(year, month - 1, 15),
    getClosestFriday(year, month - 1, 30),
    getClosestFriday(year, month, 15),
    getClosestFriday(year, month, 30),
    getClosestFriday(year, month + 1, 15),
    getClosestFriday(year, month + 1, 30),
  ];

  return candidates
    .filter(Boolean)
    .sort((a, b) => a - b);
}

export function getQuincenaFromDate(inputDate = new Date()) {
  const date =
    inputDate instanceof Date
      ? new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())
      : new Date(`${inputDate}T00:00:00`);

  const payDates = getPayDatesAround(date);

  let inicio = null;
  let fin = null;

  for (let i = 0; i < payDates.length - 1; i++) {
    const currentPay = payDates[i];
    const nextPay = payDates[i + 1];

    if (date >= currentPay && date < nextPay) {
      inicio = currentPay;
      fin = new Date(nextPay);
      fin.setDate(fin.getDate() - 1);
      break;
    }
  }

  if (!inicio || !fin) {
    const first = payDates[0];
    const second = payDates[1];

    inicio = first;
    fin = new Date(second);
    fin.setDate(fin.getDate() - 1);
  }

  return {
    inicio,
    fin,
    periodoId: `${formatDateLocal(inicio)}_${formatDateLocal(fin)}`,
    inicioStr: formatDateLocal(inicio),
    finStr: formatDateLocal(fin),
  };
}

export function getCurrentQuincena() {
  return getQuincenaFromDate(new Date());
}