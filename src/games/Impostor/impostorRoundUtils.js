export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export function getSeededRandom(seedInput) {
  let seed = 2166136261;

  for (let index = 0; index < seedInput.length; index += 1) {
    seed ^= seedInput.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(array, seedInput) {
  const random = getSeededRandom(seedInput);
  const result = [...array];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function getRoundIdentity(card) {
  return (card?.name || card?.id || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function countUniqueForRound(cards) {
  return new Set(cards.map(getRoundIdentity).filter(Boolean)).size;
}

export function takeSeededUniqueForRound(cards, amount, usedIdentities, seedInput) {
  const selectedCards = [];

  for (const card of seededShuffle(cards, seedInput)) {
    const identity = getRoundIdentity(card);
    if (!identity || usedIdentities.has(identity)) continue;

    selectedCards.push(card);
    usedIdentities.add(identity);

    if (selectedCards.length === amount) break;
  }

  return selectedCards;
}

export function takeRandomUniqueForRound(cards, amount, usedIdentities) {
  const selectedCards = [];

  for (const card of shuffle(cards)) {
    const identity = getRoundIdentity(card);
    if (!identity || usedIdentities.has(identity)) continue;

    selectedCards.push(card);
    usedIdentities.add(identity);

    if (selectedCards.length === amount) break;
  }

  return selectedCards;
}
