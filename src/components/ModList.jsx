import { Checkbox, Input, Table, Text, createStyles } from '@mantine/core'
import React, { useEffect, useState } from 'react'

export default function ModList({
  modTracker = {},
  modifyModsCallback = () => {},
  modList = [],
  ilvlRange = [],
  tierIndex = 0,
}) {
  const [matchedRows, setMatchedRows] = useState([])
  const [search, setSearch] = useState('')
  const { classes } = useStyles();

  const handleChange = (event) => {
    setSearch(event.target.value);
  }

  useEffect(() => {
    setMatchedRows(modList.filter(mod =>
      mod.equippedIlvlReq > ilvlRange[0]
      && mod.equippedIlvlReq < ilvlRange[1]
      && (search === '' || mod.description.toLowerCase().includes(search?.toLowerCase()))))
  }, [modList, ilvlRange, search])

  const handleCheckboxClicked = (tradeId) => {
    modifyModsCallback({
      type: 'toggle',
      modId: tradeId,
    })
  }

  return (
    <div className={classes.container}>
      <Text weight="bold" size="24px">Tier {tierIndex + 1}</Text>
      <Input
        type="text"
        value={search}
        placeholder="Search mods"
        onChange={handleChange}
        className={classes.searchInput}
      />
      <Table verticalSpacing="sm">
        <tbody>
          {matchedRows.map(row => (
            <tr>
              <td>
                <Checkbox
                  checked={modTracker[row.tradeId] === true}
                  onChange={() => handleCheckboxClicked(row.tradeId)}
                  transitionDuration={0}
                />
              </td>
              <td>
                {row.description} <b>(Lv{row.equippedIlvlReq})</b>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  searchInput: {
    width: '100%',
  },
}))
