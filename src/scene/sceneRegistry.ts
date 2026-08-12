import type { Group } from 'three'

let houseRoot: Group | null = null

export const setHouseRoot = (root: Group | null) => {
  houseRoot = root
}

export const getHouseRoot = () => houseRoot
