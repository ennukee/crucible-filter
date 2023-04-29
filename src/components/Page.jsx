import React, { useCallback, useEffect, useReducer, useState } from 'react'

import { Anchor, Button, Input, RangeSlider, SegmentedControl, Text, TextInput, createStyles, rem } from '@mantine/core';
import ModList from 'components/ModList';
import { generateQuery } from 'util/generateQuery';
import data from 'util/crucibleMods.json';


const reducer = (state, action) => {
  if (action.type === 'toggle') {
    return {
      ...state,
      [action.modId]: !(state[action.modId] || false)
    }
  } else if (action.type === 'reset') {
    return {}
  }
}
const initialReducerState = {}

export default function Page() {
  const [modTracker, modifyMods] = useReducer(reducer, initialReducerState)
  const [weaponType, setWeaponType] = useState('bow')
  const [ilvlRange, setIlvlRange] = useState([50, 100])
  const [tradeLink, setTradeLink] = useState('')
  const [minNodes, setMinNodes] = useState(2)
  const { classes } = useStyles();

  useEffect(() => {
    modifyMods({ type: 'reset' })
  }, [weaponType])

  const handleWeaponTypeChange = (weaponType) => {
    setWeaponType(weaponType)
  }

  const handleIlvlRangeChange = (range) => {
    setIlvlRange(range)
  }

  const handleMinNodesChange = (event) => {
    setMinNodes(event.target.value)
  }

  const handleGenerateTradeLink = useCallback(() => {
    const enabledModIds = Object.entries(modTracker).filter(mod => mod[1] === true).map(mod => mod[0])
    setTradeLink(`https://www.pathofexile.com/trade/search?q=${encodeURIComponent(JSON.stringify(generateQuery(enabledModIds, weaponType, minNodes)))}`)
  }, [modTracker, weaponType, minNodes])

  return (
    <div className={classes.container}>
      <div className={classes.headerContainer}>
        <Text size="60px">Crucible Trade Search Generator</Text>
        <Text size="16px" className={classes.subtitle}>Take note that changing weapon type or reloading the page will erase all selected mods</Text>
        <div className={classes.controls}>
          <div className={classes.generateSection}>
            <Button
              color="violet"
              size="md"
              className={classes.generateButton}
              onClick={handleGenerateTradeLink}
            >Generate Trade Link</Button>
          </div>
          {tradeLink && (
            <Anchor href={tradeLink} target="_blank" color="violet">
              Click to navigate to trade site
            </Anchor>
          )}
          <div className={classes.weaponTypePicker}>
            <SegmentedControl
              value={weaponType}
              onChange={handleWeaponTypeChange}
              data={Object.keys(data)}
              size="md"
              radius="sm"
              color="violet"
              classNames={{ control: classes.control, indicator: classes.indicator }}
            />
          </div>
          <div className={classes.sliderSection}>
            <Text className={classes.sliderLabel} weight="bold">ilvl</Text>
            <RangeSlider
              // mt="md"
              // mb="md"
              // radius="sm"
              step={1}
              color="violet"
              value={ilvlRange}
              onChange={handleIlvlRangeChange}
              labelAlwaysOn
              classNames={{
                label: classes.label,
                thumb: classes.thumb,
                dragging: classes.dragging,
                root: classes.root,
              }}
              styles={{
                width: '100%',
              }}
              marks={[
                { value: 0, label: '0' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 75, label: '75' },
                { value: 100, label: '100' },
              ]}
            />
          </div>
          <TextInput
            size="md"
            label="Minimum nodes to match"
            description="Usually the number of columns you add a node to, but not always"
            placeholder="min"
            value={minNodes}
            onChange={handleMinNodesChange}
            className={classes.generateMinNodesInput}
          />
        </div>
      </div>
      <div className={classes.modSection}>
        {Object.values(data[weaponType]).map((data, index) => (
          <ModList ilvlRange={ilvlRange} tierIndex={index} modList={data} modTracker={modTracker} modifyModsCallback={modifyMods} />
        ))}
      </div>
    </div>
  )
}

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  subtitle: {
    marginTop: '-20px',
  },
  weaponTypePicker: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  modSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '20px 30px 0 30px',
    gap: '30px',
  },
  control: {
    border: '0 !important',
  },
  generateButton: {
    // backgroundImage: theme.fn.gradient({ from: 'violet', to: 'grape' }),
    padding: '0 45px',
  },
  generateSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '5px',
  },
  generateMinNodesInput: {
    marginTop: '20px',
  },
  indicator: {
    // backgroundImage: theme.fn.gradient({ from: 'violet', to: 'grape' })
  },
  sliderSection: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  sliderLabel: {
    marginRight: '10px',
  },

  // Slider styles
  label: {
    top: 0,
    height: rem(28),
    lineHeight: rem(28),
    width: rem(34),
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 700,
    backgroundColor: 'transparent',
  },
  thumb: {
    height: rem(28),
    width: rem(34),
    border: 'none',
  },
  dragging: {
    transform: 'translate(-50%, -50%)',
  },
  root: {
    width: '100%',
  }
}));
