// basic fine calc: per-day rate
module.exports = function calcFine(dueAt, returnedAt, perDayRate = 10) {
  const due = new Date(dueAt);
  const ret = returnedAt ? new Date(returnedAt) : new Date();
  if (ret <= due) return 0;
  const msPerDay = 24*60*60*1000;
  const overdueDays = Math.ceil((ret - due) / msPerDay);
  return overdueDays * perDayRate;
};
