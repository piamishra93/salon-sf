import { writeFileSync } from 'fs'
import { join } from 'path'
import { scrapeSFMOMA } from './sfmoma'
import { scrapeFAMSF } from './famsf'
import { scrapeLuma } from './luma'
import { scrapeCityLights } from './citylights'
import { scrapeMSP } from './msp'
import type { SalonEvent } from '../src/lib/types'

async function run() {
  console.log('Running scrapers...')

  const results = await Promise.allSettled([
    scrapeSFMOMA(),
    scrapeFAMSF(),
    scrapeLuma(),
    scrapeCityLights(),
    scrapeMSP(),
  ])

  const sourceNames = ['SFMOMA', 'FAMSF', 'Luma', 'City Lights', 'Minnesota Street Project']
  const allEvents: SalonEvent[] = []

  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      console.log(`✓ ${sourceNames[i]}: ${result.value.length} events`)
      allEvents.push(...result.value)
    } else {
      console.error(`✗ ${sourceNames[i]}: ${result.reason}`)
    }
  }

  // Deduplicate by id
  const seen = new Set<string>()
  const deduped = allEvents.filter(e => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  // Sort by date then time
  deduped.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })

  const outputPath = join(process.cwd(), 'data', 'events.json')
  writeFileSync(outputPath, JSON.stringify(deduped, null, 2))
  console.log(`\nWrote ${deduped.length} events to data/events.json`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
