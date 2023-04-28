/**
 * PLEASE READ IF RUNNING THIS SCRIPT FOR THE FIRST TIME ON A FRESH PULL OF THE REPO
 * 
 * You need two files in order to make this work
 *  1. poedb.txt -- Go to https://poedb.tw/us/Weapon_passive and download the HTML as a txt file (you will likely need to right-click "View source"
 *                  instead of doing "Save as" due to the massive size of this file causing weird issues in the "Save as" download)
 *  2. mods.json -- Visit https://www.pathofexile.com/api/trade/data/stats and download the entire JSON file, name it mods.json and place
 *                  it in this directory
 * 
 * These are two very large files and are not optimal to check into git, so get them manually
 */

const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');

const mods = require('./mods.json');
const crucibleMods = mods.result.find(mod => mod.id === 'crucible')

const weaponTypeToPoeDbDivId = {
  bow: 'BowsWeaponPassive',
  claw: 'ClawsWeaponPassive',
  onesword: 'OneHandSwordsWeaponPassive',
  sceptre: 'SceptresWeaponPassive',
  staff: 'StavesWeaponPassive',
  twosword: 'TwoHandSwordsWeaponPassive',
  wand: 'WandsWeaponPassive',
}

// These are for cases where the PoEDB and official texts differ, usually due to lines being swapped
const manualNameOverrides = {
  '+1 to Minimum Endurance, Frenzy and Power Charges-1 to Maximum Endurance, Frenzy and Power Charges': '-1 to Maximum Endurance, Frenzy and Power Charges+1 to Minimum Endurance, Frenzy and Power Charges',
  '+2 to Minimum Endurance, Frenzy and Power Charges-1 to Maximum Endurance, Frenzy and Power Charges': '-1 to Maximum Endurance, Frenzy and Power Charges+2 to Minimum Endurance, Frenzy and Power Charges',
  'Adds 5 to 10 Fire DamageAdds 5 to 10 Cold DamageAdds 1 to 0 Lightning Damage': 'Adds 5 to 10 Fire DamageAdds 5 to 10 Cold DamageAdds 1 to 15 Lightning Damage',
  'Adds 9 to 15 Fire DamageAdds 9 to 15 Cold DamageAdds 1 to 0 Lightning Damage': 'Adds 9 to 15 Fire DamageAdds 9 to 15 Cold DamageAdds 1 to 23 Lightning Damage',
  'Adds 18 to 27 Fire DamageAdds 18 to 27 Cold DamageAdds 3 to 0 Lightning Damage': 'Adds 18 to 27 Fire DamageAdds 18 to 27 Cold DamageAdds 3 to 42 Lightning Damage',
  'Adds 10 to 17 Fire DamageAdds 10 to 17 Cold DamageAdds 3 to 0 Lightning Damage': 'Adds 10 to 17 Fire DamageAdds 10 to 17 Cold DamageAdds 3 to 26 Lightning Damage',
  'Adds 17 to 26 Fire DamageAdds 17 to 26 Cold DamageAdds 3 to 0 Lightning Damage': 'Adds 17 to 26 Fire DamageAdds 17 to 26 Cold DamageAdds 3 to 42 Lightning Damage',
  'Adds 34 to 49 Fire DamageAdds 34 to 49 Cold DamageAdds 4 to 0 Lightning Damage': 'Adds 34 to 49 Fire DamageAdds 34 to 49 Cold DamageAdds 4 to 78 Lightning Damage',
  'Adds 3 to 6 Fire DamageAdds 3 to 6 Cold DamageAdds 1 to 0 Lightning Damage5% chance to Freeze, Shock and Ignite': 'Adds 3 to 6 Fire DamageAdds 3 to 6 Cold DamageAdds 1 to 8 Lightning Damage5% chance to Freeze, Shock and Ignite',
  'Adds 6 to 10 Fire DamageAdds 6 to 10 Cold DamageAdds 1 to 0 Lightning Damage5% chance to Freeze, Shock and Ignite': 'Adds 6 to 10 Fire DamageAdds 6 to 10 Cold DamageAdds 1 to 13 Lightning Damage5% chance to Freeze, Shock and Ignite',
  'Adds 13 to 20 Fire DamageAdds 13 to 20 Cold DamageAdds 3 to 0 Lightning Damage5% chance to Freeze, Shock and Ignite': 'Adds 13 to 20 Fire DamageAdds 13 to 20 Cold DamageAdds 3 to 25 Lightning Damage5% chance to Freeze, Shock and Ignite',
  'Adds 3 to 6 Fire DamageAdds 3 to 6 Cold DamageAdds 1 to 0 Lightning Damage15% increased Effect of Non-Damaging Ailments': 'Adds 3 to 6 Fire DamageAdds 3 to 6 Cold DamageAdds 1 to 8 Lightning Damage15% increased Effect of Non-Damaging Ailments',
  'Adds 4 to 9 Fire DamageAdds 4 to 9 Cold DamageAdds 1 to 0 Lightning Damage15% increased Effect of Non-Damaging Ailments': 'Adds 4 to 9 Fire DamageAdds 4 to 9 Cold DamageAdds 1 to 13 Lightning Damage15% increased Effect of Non-Damaging Ailments',
  'Adds 11 to 15 Fire DamageAdds 11 to 15 Cold DamageAdds 3 to 0 Lightning Damage15% increased Effect of Non-Damaging Ailments': 'Adds 11 to 15 Fire DamageAdds 11 to 15 Cold DamageAdds 3 to 25 Lightning Damage15% increased Effect of Non-Damaging Ailments',
  '+40% to Global Critical Strike Multiplier-3% to Critical Strike Chance': '-3% to Critical Strike Chance+40% to Global Critical Strike Multiplier',
  '+50% to Global Critical Strike Multiplier-3% to Critical Strike Chance': '-3% to Critical Strike Chance+50% to Global Critical Strike Multiplier',
  '+60% to Global Critical Strike Multiplier-3% to Critical Strike Chance': '-3% to Critical Strike Chance+60% to Global Critical Strike Multiplier',
  '+80% to Global Critical Strike Multiplier-3% to Critical Strike Chance': '-3% to Critical Strike Chance+80% to Global Critical Strike Multiplier',
  '+100% to Global Critical Strike Multiplier-3% to Critical Strike Chance': '-3% to Critical Strike Chance+100% to Global Critical Strike Multiplier',
  'Adds 7 to 11 Fire DamageAdds 7 to 11 Cold DamageAdds 3 to 0 Lightning Damage10% chance to Freeze, Shock and Ignite': 'Adds 7 to 11 Fire DamageAdds 7 to 11 Cold DamageAdds 3 to 15 Lightning Damage10% chance to Freeze, Shock and Ignite',
  'Adds 12 to 20 Fire DamageAdds 12 to 20 Cold DamageAdds 3 to 0 Lightning Damage10% chance to Freeze, Shock and Ignite': 'Adds 12 to 20 Fire DamageAdds 12 to 20 Cold DamageAdds 3 to 25 Lightning Damage10% chance to Freeze, Shock and Ignite',
  'Adds 24 to 35 Fire DamageAdds 24 to 35 Cold DamageAdds 4 to 0 Lightning Damage10% chance to Freeze, Shock and Ignite': 'Adds 24 to 35 Fire DamageAdds 24 to 35 Cold DamageAdds 4 to 46 Lightning Damage10% chance to Freeze, Shock and Ignite',
  'Adds 7 to 10 Fire DamageAdds 7 to 10 Cold DamageAdds 3 to 0 Lightning Damage25% increased Effect of Non-Damaging Ailments': 'Adds 7 to 10 Fire DamageAdds 7 to 10 Cold DamageAdds 3 to 15 Lightning Damage25% increased Effect of Non-Damaging Ailments',
  'Adds 9 to 17 Fire DamageAdds 9 to 17 Cold DamageAdds 3 to 0 Lightning Damage25% increased Effect of Non-Damaging Ailments': 'Adds 9 to 17 Fire DamageAdds 9 to 17 Cold DamageAdds 3 to 25 Lightning Damage25% increased Effect of Non-Damaging Ailments',
  'Adds 20 to 29 Fire DamageAdds 20 to 29 Cold DamageAdds 4 to 0 Lightning Damage25% increased Effect of Non-Damaging Ailments': 'Adds 20 to 29 Fire DamageAdds 20 to 29 Cold DamageAdds 4 to 46 Lightning Damage25% increased Effect of Non-Damaging Ailments',
  // '': '',
}

const main = async () => {
  const output = {}
  const erroredModTexts = []
  Object.entries(weaponTypeToPoeDbDivId).forEach(([weaponType, poeDbId]) => {
    output[weaponType] = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    }
    /**
     * Process
     * 
     * 1. Get all rows
     * 2. Pick out the following from each row: Tier (1/2/3/4/5), Weighting, Mod Name
     * 3. Lookup mod id for given mod name, attach it to the object
     * 4. Use all this information to generate the data file for the FE
     */

    const POEDB_HTML = fs.readFileSync(path.resolve(__dirname, 'poedb.txt'), 'utf8');
    const dom = new jsdom.JSDOM(POEDB_HTML);
    const cssSelector = `.tab-pane#${poeDbId} tr[role^="row"]`

    // eslint-disable-next-line no-unused-vars
    const a = [...dom.window.document.querySelectorAll(cssSelector)].forEach(row => {
      const tds = [...row.querySelectorAll('td')]
      if (tds.length < 2 || !tds[0] || !tds[1]) return;
      let modText = tds[1].textContent.trim(' ')

      // Contains trade ID and full name
      let relevantEntry = crucibleMods.entries.find(entry => {
        if (manualNameOverrides[modText]) {
          // If we have a defined manual override for a poedb naming error, override it here
          modText = manualNameOverrides[modText]
        }
        const trimmedOfficialText = entry.text.replaceAll(/\(Tier [1-9]\)|\n/g, '').trim(' ')
        return trimmedOfficialText === modText
      })
      if (!relevantEntry) {
        console.log('Issue finding matching mod for poedb text:', modText)
        erroredModTexts.push(modText)

        // Adjust entry with some manual inputs so we can fix manually later
        relevantEntry = {
          flagged: true,
          tradeId: 'FIX_ME',
          description: 'FIX_ME',
          poeDbTextRemoveWhenFixed: modText,
        }
      }
      
      // Match all cases of tiers (some are present on up to 3 unique columns)
      const modTierRegex = /^(\d+)\s*\(\s*(T\d+)(?:\s*, \s*(T\d+))?(?:\s*, \s*(T\d+))?\s*\)$/g
      const matches = modTierRegex.exec(tds[0].textContent)
      if (matches) {
        const [, modWeight, tier, extraTier1, extraTier2] = matches;
        const tiers = [tier, extraTier1, extraTier2]
        tiers.forEach(t => {
          if (!t) return;
          output[weaponType][t.slice(-1)].push({
            tradeId: relevantEntry.id,
            description: relevantEntry.text,
            weighting: modWeight,

            // Put all flags in if it's a bugged entry, to be fixed manually
            ...(relevantEntry.flagged ? relevantEntry : {})
          })
        })
      }
    })

  })

  fs.writeFile('../src/util/crucibleMods.json', JSON.stringify(output, null, 2), null, () => {})
}

main()
