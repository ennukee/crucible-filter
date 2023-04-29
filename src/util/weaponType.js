export const idMap = {
  bow: 'Bow',
  claw: 'Claw',
  onesword: '1H Sword',
  twosword: '2H Sword',
  oneaxe: '1H Axe',
  twoaxe: '2H Axe',
  onemace: '1H Mace',
  twomace: '2H Mace',
  dagger: 'Dagger',
  runedagger: 'Rune Dagger',
  shield: 'Shield',
  sceptre: 'Sceptre',
  staff: 'Staves',
  wand: 'Wand',
  helmet: 'Unique Helmet',
}

export const convertArray = (array) => array.map(id => idMap[id] || id)

export const generateSegmentedControlData = (array) => array.map(id => ({
  label: idMap[id] || id,
  value: id,
}))
