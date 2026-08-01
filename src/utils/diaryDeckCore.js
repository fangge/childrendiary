export const modulo = (value, length) => length > 0 ? ((value % length) + length) % length : 0;

export const getInitialIndex = (diaries, selectedDiaryId) => {
  if (!diaries.length) return 0;
  const selected = diaries.findIndex((diary) => diary.id === selectedDiaryId);
  return selected >= 0 ? selected : 0;
};

export const getSlotOffsets = (slotCount = 15) => {
  const half = Math.floor(slotCount / 2);
  return Array.from({ length: slotCount }, (_, slot) => slot - half);
};
