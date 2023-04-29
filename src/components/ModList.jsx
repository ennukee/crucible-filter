import { Button, Checkbox, Input, RangeSlider, Table, Text, createStyles, rem } from '@mantine/core'
import React, { useEffect, useState } from 'react'

const searchMatch = (query, toMatch) => {
  if (!query) return true;

  if (query.startsWith('~')) {
    const actualQuery = query.slice(1)
    return actualQuery.split(' ').every(word => toMatch.includes(word))
  } else {
    return toMatch.includes(query)
  }
}

export default function ModList({
  modTracker = {},
  modifyModsCallback = () => {},
  modList = [],
  ilvlRange = [],
  tierIndex = 0,
}) {
  const [matchedRows, setMatchedRows] = useState([])
  const [tierRange, setTierRange] = useState([1, 5])
  const [search, setSearch] = useState('')
  const { classes } = useStyles();

  const handleChange = (event) => {
    setSearch(event.target.value);
  }

  useEffect(() => {
    setMatchedRows(modList.filter(mod =>
      mod.equippedIlvlReq >= ilvlRange[0]
      && mod.equippedIlvlReq <= ilvlRange[1]
      && mod.tier >= tierRange[0]
      && mod.tier <= tierRange[1]
      && searchMatch(search?.toLowerCase(), mod.description.toLowerCase())))
      // && (search === '' || mod.description.toLowerCase().includes(search?.toLowerCase()))))
  }, [modList, ilvlRange, search, tierRange])

  const handleCheckboxClicked = (tradeId) => {
    modifyModsCallback({
      type: 'toggle',
      modId: tradeId,
    })
  }

  const handleSelectAllFilteredClick = () => {
    matchedRows.forEach(mod => {
      modifyModsCallback({
        type: 'toggle',
        override: true,
        modId: mod.tradeId,
      })
    })
  }

  const handleUnselectAllFilteredClick = () => {
    matchedRows.forEach(mod => {
      modifyModsCallback({
        type: 'toggle',
        override: false,
        modId: mod.tradeId,
      })
    })
  }

  const handleTierRangeChange = (value) => {
    setTierRange(value)
  }

  return (
    <div className={classes.container}>
      <Text weight="bold" size="24px">Column {tierIndex + 1}</Text>
      <Input
        type="text"
        value={search}
        placeholder="Search mods"
        onChange={handleChange}
        className={classes.searchInput}
      />
      <div className={classes.filtersRow2}>
        <Button
          color="violet"
          size="sm"
          className={classes.generateButton}
          onClick={handleSelectAllFilteredClick}
        >Select All</Button>
        <Button
          color="violet"
          size="sm"
          className={classes.generateButton}
          onClick={handleUnselectAllFilteredClick}
        >Unselect All</Button>
        <RangeSlider
          step={1}
          min={1}
          max={5}
          minRange={0}
          color="violet"
          value={tierRange}
          onChange={handleTierRangeChange}
          labelAlwaysOn
          classNames={{
            label: classes.label,
            thumb: classes.thumb,
            dragging: classes.dragging,
            root: classes.root,
            mark: classes.mark,
          }}
          styles={{
            width: '100%',
          }}
          marks={[
            { value: 3, label: 'Mod Tier' },
          ]}
        />
      </div>
      <Table verticalSpacing="sm">
        <tbody>
          {matchedRows.map(row => (
            <tr>
              <td>
                <Checkbox
                  color="violet"
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
    gap: '10px'
  },
  searchInput: {
    width: '100%',
  },
  filtersRow2: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: '10px',
  },

  // Slider styles
  label: {
    top: 0,
    height: rem(28),
    lineHeight: rem(28),
    width: rem(24),
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 700,
    backgroundColor: 'transparent',
  },
  thumb: {
    height: rem(28),
    width: rem(18),
    border: 'none',
  },
  dragging: {
    transform: 'translate(-50%, -50%)',
  },
  root: {
    width: '100%',
  },
  mark: {
    marginBottom: '5px',
    backgroundColor: 'transparent',
  }
}))
