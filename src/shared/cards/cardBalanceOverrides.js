const CARD_BALANCE_OVERRIDES = {
  TOY_809: {
    cost: 3,
    attack: 3,
    health: 3,
    balancePatch: "34.2.2",
    balanceNote: "Cardboard Golem: 3 mana 3/3",
  },
  TIME_429: {
    cost: 4,
    attack: 4,
    health: 5,
    balancePatch: "34.2.2",
    balanceNote: "Divine Augur: 4 mana 4/5",
  },
  TIME_447: {
    cost: 1,
    balancePatch: "34.2.2",
    balanceNote: "Power Word: Barrier: 1 mana",
  },
  TIME_448: {
    cost: 3,
    balancePatch: "34.2.2",
    balanceNote: "Solitude: 3 mana",
  },
  TIME_704: {
    cost: 7,
    balancePatch: "34.2.2",
    balanceNote: "Highborne Mentor: 7 mana",
  },
  TIME_730: {
    cost: 2,
    attack: 2,
    health: 3,
    balancePatch: "34.2.2",
    balanceNote: "Kaldorei Cultivator: 2 mana 2/3",
  },
  TIME_861: {
    cost: 3,
    attack: 3,
    health: 3,
    balancePatch: "34.2.2",
    balanceNote: "Timelooper Toki: 3 mana 3/3",
  },
};

export function applyCardBalanceOverrides(cards = []) {
  return cards.map((card) => {
    const override = CARD_BALANCE_OVERRIDES[card?.id];

    if (!override) return card;

    return {
      ...card,
      ...override,
      balanceOverrideApplied: true,
    };
  });
}

export function getCardBalanceOverride(cardId) {
  return CARD_BALANCE_OVERRIDES[cardId] ?? null;
}
