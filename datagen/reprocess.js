/**
 * This version is to reprocess the crucibleMods file without needing to
 * reuse the poedb dump file. This is substantially less cost intensive and
 * also does not spam the poedb hover tooltip server 
 * 
 * This is custom written for a specific use case, and code may be deleted
 * and added as they become needed or not. Code below is likely to be
 * only the most recent use case.
 * 
 * Make sure to review the output and copy it into the crucibleMods.json file if the
 * reprocess looks good
 * @output {./reviewMe.json}
 * 
 * ! REQUIRES DATAGEN TO HAVE RUN AT LEAST ONCE AND CREATE crucibleMods.json in src/util/ !
 */

const fs = require('fs');
const data = require('../src/util/crucibleMods')

const addTierFields = () => {
  // const newOutput = {}
  // Object.entries(data).forEach(([weaponType, tierArray]) => {
  //   newOutput[weaponType] = {}
  //   Object.entries(tierArray).forEach(([column, mods]) => {
  //     newOutput[weaponType][column] = mods.map(mod => {
  //       const tierRegex = /\(Tier ([1-9])\)/g
  //       const matches = tierRegex.exec(mod.description)
  //       if (!matches) {
  //         console.log('found case without a tier:', mod)
  //         return mod
  //       }
  //       return {
  //         ...mod,
  //         tier: +matches[1],
  //       }
  //     })
  //   })
  // })
  
  // fs.writeFile('./reviewMe.json', JSON.stringify(newOutput, null, 2), null, () => {})
}

const calculateTotalWeight = () => {
  const totalsByWeaponType = {}
  Object.entries(data).forEach(([weaponType, tierArray]) => {
    totalsByWeaponType[weaponType] = {}
    Object.entries(tierArray).forEach(([column, mods]) => {
      totalsByWeaponType[weaponType][column] = 0
      mods.forEach(mod => {
        totalsByWeaponType[weaponType][column] += (+mod.weighting)
      })
    })
  })

  const newOutput = {}
  Object.entries(data).forEach(([weaponType, tierArray]) => {
    newOutput[weaponType] = {}
    Object.entries(tierArray).forEach(([column, mods]) => {
      newOutput[weaponType][column] = mods.map(mod => ({
        ...mod,
        totalColumnWeighting: totalsByWeaponType[weaponType][column],
      }))
    })
  })

  fs.writeFile('./reviewMe.json', JSON.stringify(newOutput, null, 2), null, () => {})
}

module.exports = {
  modifications: [addTierFields, calculateTotalWeight]
}

calculateTotalWeight()