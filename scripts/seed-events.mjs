import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import process from 'node:process'

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

const users = JSON.parse(
  fs.readFileSync('./scripts/test-users.json', 'utf-8')
)

// Получаем реальные user_id из auth
async function getProfiles() {
  const { data, error } = await supabase.from('profiles').select('*')

  if (error) throw error
  return data
}

// Генерация дат
function futureDate(daysAhead) {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  date.setHours(18, 0, 0, 0)
  return date.toISOString()
}

const eventTemplates = [
  {
    title: 'Кофе в центре',
    description: 'Собираемся на кофе и общение',
    activity_type: 'coffee',
  },
  {
    title: 'Прогулка в парке',
    description: 'Лёгкая прогулка и разговоры',
    activity_type: 'walk',
  },
  {
    title: 'Футбик',
    description: 'Играем, не хватает людей',
    activity_type: 'sport',
  },
  {
    title: 'Настолки вечером',
    description: 'Берём настолки и собираемся',
    activity_type: 'games',
  },
  {
    title: 'Пиво в пятницу',
    description: 'Неформальная встреча под пиво, встречаемся в центе и дальше уже по ситуации',
    activity_type: 'bar',
  },
]

const locations = [
  'Центр',
  'Дендрарий',
  'Valea Morilor',
  'Ботаника',
  'Рышкановка',
]

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomParticipants(users, creatorId) {
  return users
    .filter((u) => u.id !== creatorId)
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 4) + 2)
}

async function createEvent(event, creatorId) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: event.title,
      description: event.description,
      date_time: event.date_time,
      location: event.location,
      activity_type: event.activity_type,
      creator_id: creatorId,
      city: 'Chisinau',
      city_normalized: 'chisinau',
    })
    .select()
    .single()

  if (error) throw error

  return data
}

async function addParticipants(eventId, participants) {
  const rows = participants.map((p) => ({
    event_id: eventId,
    user_id: p.id,
  }))

  const { error } = await supabase.from('participants').insert(rows)

  if (error) throw error
}

async function main() {
  console.log('Seeding events...')

  const profiles = await getProfiles()

  const organizers = profiles.slice(0, 3)

  for (let i = 0; i < 20; i++) {
    const template = random(eventTemplates)
    const creator = random(organizers)

    const event = {
      ...template,
      location: random(locations),
      date_time: futureDate(Math.floor(Math.random() * 5)),
    }

    const createdEvent = await createEvent(event, creator.id)

    const participants = randomParticipants(profiles, creator.id)

    await addParticipants(createdEvent.id, participants)

    console.log(
      `Event created: ${event.title} | participants: ${participants.length}`
    )
  }

  console.log('Events seed completed')
}

main().catch(console.error)