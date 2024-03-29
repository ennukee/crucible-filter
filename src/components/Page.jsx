import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { Anchor, Button, RangeSlider, SegmentedControl, Switch, Text, TextInput, createStyles, rem } from '@mantine/core';
import ModList from 'components/ModList';
import { generateQuery } from 'util/generateQuery';
import data from 'util/crucibleMods.json';
import { generateSegmentedControlData } from 'util/weaponType';

/**
 * ! MAKE SURE THIS IS UPDATED WITH EACH RELEASE, AS WELL AS CHANGELOG.MD
 */
const VERSION_NUMBER = '1.1.3a';

const reducer = (state, action) => {
  if (action.type === 'toggle') {
    if (action.override !== undefined) {
      return {
        ...state,
        [action.modId]: action.override,
      }
    }
    return {
      ...state,
      [action.modId]: !(state[action.modId] || false)
    }
  } else if (action.type === 'reset') {
    return {}
  }
}
const initialReducerState = {}

const visibilityReducer = (state, action) => {
  if (action.type === 'toggle') {
    return {
      ...state,
      [action.index]: !state[action.index],
    }
  }
}
const initialVisibilityState = { 0: true, 1: true, 2: true, 3: true, 4: true }

export default function Page() {
  const [modTracker, modifyMods] = useReducer(reducer, initialReducerState)
  const [weaponType, setWeaponType] = useState('bow')
  const [tradeLink, setTradeLink] = useState('')
  const [minNodes, setMinNodes] = useState(2)
  const [ilvlRange, setIlvlRange] = useState([1, 68])
  const [fnIlvlRange, setFnIlvlRange] = useState([1, 68])
  const [columnVisibility, modifyVisibility] = useReducer(visibilityReducer, initialVisibilityState)

  const timeoutRef = useRef();
  const { classes } = useStyles();

  useEffect(() => {
    modifyMods({ type: 'reset' })
  }, [weaponType])

  const handleWeaponTypeChange = (weaponType) => {
    console.log(1, weaponType)
    setWeaponType(weaponType)
  }

  const handleIlvlRangeChange = (range) => {
    setIlvlRange(range)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setFnIlvlRange(range)
    }, 250)
  }

  const handleMinNodesChange = (event) => {
    setMinNodes(event.target.value)
  }

  const handleGenerateTradeLink = useCallback(() => {
    const enabledModIds = Object.entries(modTracker).filter(mod => mod[1] === true).map(mod => mod[0])
    const typeString = ['helmet', 'shield'].includes(weaponType) ? `armour.${weaponType}` : `weapon.${weaponType}`
    setTradeLink(`https://www.pathofexile.com/trade/search?q=${encodeURIComponent(JSON.stringify(generateQuery(enabledModIds, typeString, minNodes)))}`)
  }, [modTracker, weaponType, minNodes])

  const handleToggleColumnVisibility = (index) => {
    modifyVisibility({
      type: 'toggle',
      index,
    })
  }

  return (
    <div className={classes.container}>
      <div className={classes.headerContainer}>
        <Text size="60px">Crucible Trade Search Generator</Text>
        <Text size="16px" className={classes.subtitle}>
          Take note that changing weapon type or reloading the page will erase all selected mods <Anchor color="violet" href="https://github.com/ennukee/crucible-filter/blob/master/changelog.md" target="_blank">(ver. {VERSION_NUMBER})</Anchor>
        </Text>
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
              data={generateSegmentedControlData(Object.keys(data))}
              size="md"
              radius="sm"
              color="violet"
              classNames={{ control: classes.control, indicator: classes.indicator }}
            />
          </div>
          <div className={classes.sliderSection}>
            <RangeSlider
              step={1}
              color="violet"
              minRange={5}
              min={1}
              max={68}
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
                { value: 1, label: '1' },
                { value: 17, label: '17' },
                { value: 34, label: 'Item Level Req' },
                { value: 51, label: '51' },
                { value: 68, label: '68' },
              ]}
            />
          </div>
          <div className={classes.secondRowControls}>
            <TextInput
              size="md"
              label="Minimum nodes to match"
              description="Usually the number of columns you add a node to, but not always"
              placeholder="min"
              value={minNodes}
              onChange={handleMinNodesChange}
              className={classes.generateMinNodesInput}
            />
            <div className={classes.columnSwitchContainer}>
              <Text weight="bold" size="lg">Enable/Disable Columns</Text>
              <div className={classes.columnSwitches}>
                {[0,1,2,3,4].map(index => (
                  <Switch
                    color="violet"
                    labelPosition="left"
                    size="md"
                    label={index + 1}
                    checked={columnVisibility[index]}
                    onClick={() => handleToggleColumnVisibility(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.modSection}>
        {Object.values(data[weaponType]).map((data, index) => columnVisibility[index] && (
          <ModList ilvlRange={fnIlvlRange} tierIndex={index} modList={data} modTracker={modTracker} modifyModsCallback={modifyMods} />
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
  secondRowControls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
  },
  columnSwitches: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },
  columnSwitchContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '30px',
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
