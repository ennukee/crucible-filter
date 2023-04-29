/**
 * Takes in a list of mod id strings (e.g. crucible.mod_55555) and
 * the weapon type (e.g. weapon.wand)
 * 
 * @param {string[]} modList 
 * @param {string} weaponType 
 * @returns A query to be used in the trade site's "q=" query param
 */
export const generateQuery = (modList, type, minNodes = 1) => ({
  query: {
    status: {
      option: "online"
    },
    stats: [
      {
        type: "and",
        filters: []
      },
      {
        filters: [
          ...modList.map(mod => ({
            id: mod
          })),
        ],
        type: "crucible",
        value: {
          min: minNodes,
        }
      }
    ],
    filters: {
      trade_filters: {
        filters: {
          collapse: {
            option: "true"
          }
        }
      },
      type_filters: {
        filters: {
          category: {
            option: type
          }
        }
      }
    }
  },
  sort: {
    price: "asc"
  }
})