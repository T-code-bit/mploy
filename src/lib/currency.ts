export const formatMinorCurrency = (
  amount: number | string | null | undefined,
  currency = "KES",
) => {
  const minorUnits = Number(amount ?? 0);
  const majorUnits = Number.isFinite(minorUnits) ? minorUnits / 100 : 0;

  return `${currency} ${majorUnits.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};