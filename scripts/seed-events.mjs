import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import process from 'node:process'

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const seedUsers = JSON.parse(
  fs.readFileSync('./scripts/test-users.json', 'utf-8')
)

function toIsoLocal(daysFromNow, hour, minute = 0) {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMilliseconds(0)
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const curatedEvents = [
  {
    title: 'Кофе после работы',
    description:
      'Буду брать кофе после работы в центре. Если кто-то тоже хочет ненадолго выбраться и поболтать, присоединяйтесь.',
    activity_type: 'coffee',
    date_time: toIsoLocal(1, 18, 30),
    location: 'Strada 31 August 1989 117, Chișinău, Moldova',
    location_place_id: 'seed-31-august-117',
    location_lat: 47.0241,
    location_lng: 28.8375,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Прогулка у Valea Morilor',
    description:
      'Хочу вечером пройтись вокруг озера без спешки. Можно просто подойти на круг или даже на полчаса.',
    activity_type: 'walk',
    date_time: toIsoLocal(1, 20, 0),
    location: 'Valea Morilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-morilor',
    location_lat: 47.0142,
    location_lng: 28.8198,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.5@example.com',
    ],
  },
  {
    title: 'Небольшая встреча в кафе',
    description:
      'Собираемся спокойно посидеть в кафе, познакомиться и пообщаться без какого-то формального плана.',
    activity_type: 'networking',
    date_time: toIsoLocal(2, 19, 15),
    location: 'Strada Alexei Șciusev 62, Chișinău, Moldova',
    location_place_id: 'seed-sciusev-62',
    location_lat: 47.0218,
    location_lng: 28.8249,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.2@example.com',
      'gathr.seed.7@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Днём обсудить языки и учебу',
    description:
      'Если кто-то сейчас тоже в теме языков, учебы или полезных материалов, можно встретиться и спокойно это обсудить.',
    activity_type: 'education',
    date_time: toIsoLocal(3, 12, 30),
    location: 'Strada Mitropolit Gavriil Bănulescu-Bodoni 61, Chișinău, Moldova',
    location_place_id: 'seed-bodoni-61',
    location_lat: 47.0282,
    location_lng: 28.8357,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Кофе в центре ближе к вечеру',
    description:
      'Буду в центре ближе к вечеру. Если кто-то тоже там будет, можно быстро пересечься на кофе.',
    activity_type: 'coffee',
    date_time: toIsoLocal(3, 18, 40),
    location: 'Piața Marii Adunări Naționale 1, Chișinău, Moldova',
    location_place_id: 'seed-pman-1',
    location_lat: 47.0245,
    location_lng: 28.8323,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.4@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Мини-футбол на Ботанике',
    description:
      'Собираемся поиграть вечером без жёсткого уровня. Главное прийти, остальное уже решим на месте.',
    activity_type: 'sport',
    date_time: toIsoLocal(3, 20, 20),
    location: 'Bd. Dacia 45, Chișinău, Moldova',
    location_place_id: 'seed-dacia-45',
    location_lat: 46.9897,
    location_lng: 28.8573,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.8@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Настолки после работы',
    description:
      'Хочу собраться на простые настолки без сложных правил. Подходит и тем, кто просто хочет спокойно посидеть в компании.',
    activity_type: 'games',
    date_time: toIsoLocal(5, 17, 45),
    location: 'Strada Vlaicu Pârcălab 45, Chișinău, Moldova',
    location_place_id: 'seed-parcalab-45',
    location_lat: 47.0226,
    location_lng: 28.8351,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
    ],
  },
  {
    title: 'Прогулка по Дендрарию',
    description:
      'Вечером хочу пройтись по Дендрарию. Формат максимально простой, можно присоединиться хоть на часть маршрута.',
    activity_type: 'walk',
    date_time: toIsoLocal(5, 19, 20),
    location: 'Parcul Dendrariu, Chișinău, Moldova',
    location_place_id: 'seed-dendrarium',
    location_lat: 47.031,
    location_lng: 28.8012,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Кофе и разговоры про проекты',
    description:
      'Если кому-то интересно поговорить про приложения, идеи, работу или просто что-то своё, можно собраться днём на кофе.',
    activity_type: 'networking',
    date_time: toIsoLocal(6, 13, 0),
    location: 'Strada Pușkin 24, Chișinău, Moldova',
    location_place_id: 'seed-puskin-24',
    location_lat: 47.0287,
    location_lng: 28.8354,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
    ],
  },
  {
    title: 'Вечерняя прогулка в Valea Trandafirilor',
    description:
      'Кто хочет просто выйти прогуляться вечером и немного отвлечься, можно встретиться в парке.',
    activity_type: 'walk',
    date_time: toIsoLocal(6, 18, 10),
    location: 'Parcul Valea Trandafirilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-trandafirilor',
    location_lat: 46.998,
    location_lng: 28.8494,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.4@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.7@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Футбол вечером для своих',
    description:
      'Собираемся своим кругом, но новые люди тоже ок. Играем без лишнего напряжения, просто ради движения и настроения.',
    activity_type: 'sport',
    date_time: toIsoLocal(6, 20, 30),
    location: 'Strada Grenoble 191, Chișinău, Moldova',
    location_place_id: 'seed-grenoble-191',
    location_lat: 46.9756,
    location_lng: 28.8579,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Небольшая встреча в выходной',
    description:
      'Хочу в выходной ненадолго выбраться из дома и пообщаться. Если тоже хочется живого контакта без сложного плана, приходите.',
    activity_type: 'networking',
    date_time: toIsoLocal(7, 17, 20),
    location: 'Strada Arborilor 21, Chișinău, Moldova',
    location_place_id: 'seed-arborilor-21',
    location_lat: 46.9901,
    location_lng: 28.8458,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.8@example.com',
    ],
  },
]

async function loadProfilesForSeedUsers() {
  const emails = seedUsers.map((user) => user.email.toLowerCase())

  const { data: authUsersData, error: authError } =
    await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

  if (authError) {
    throw authError
  }

  const matchedAuthUsers = authUsersData.users.filter(
    (user) => user.email && emails.includes(user.email.toLowerCase())
  )

  if (matchedAuthUsers.length !== seedUsers.length) {
    console.error('Expected seed users:', emails)
    console.error(
      'Found auth users:',
      matchedAuthUsers.map((u) => u.email)
    )
    throw new Error('Not all seed users were found in auth.users')
  }

  const ids = matchedAuthUsers.map((user) => user.id)

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', ids)

  if (profilesError) {
    throw profilesError
  }

  if (!profiles || profiles.length !== seedUsers.length) {
    throw new Error('Not all seed users were found in profiles')
  }

  const byEmail = {}

  for (const authUser of matchedAuthUsers) {
    const profile = profiles.find((p) => p.id === authUser.id)
    if (!profile) continue

    byEmail[authUser.email.toLowerCase()] = {
      id: authUser.id,
      email: authUser.email.toLowerCase(),
      name: profile.name,
    }
  }

  return byEmail
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
      location_place_id: event.location_place_id,
      location_lat: event.location_lat,
      location_lng: event.location_lng,
      city: event.city,
      city_normalized: event.city_normalized,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function addParticipants(eventId, userIds) {
  const rows = userIds.map((userId) => ({
    event_id: eventId,
    user_id: userId,
  }))

  const { error } = await supabase.from('participants').insert(rows)

  if (error) {
    throw error
  }
}

async function main() {
  console.log('SEED EVENTS STARTED')

  const usersByEmail = await loadProfilesForSeedUsers()

  for (const event of curatedEvents) {
    const creator = usersByEmail[event.creatorEmail.toLowerCase()]
    if (!creator) {
      throw new Error(`Creator not found: ${event.creatorEmail}`)
    }

    const participantIds = [
      creator.id,
      ...event.participantEmails.map((email) => {
        const user = usersByEmail[email.toLowerCase()]
        if (!user) {
          throw new Error(`Participant not found: ${email}`)
        }
        return user.id
      }),
    ]

    const uniqueParticipantIds = [...new Set(participantIds)]

    const createdEvent = await createEvent(event, creator.id)
    await addParticipants(createdEvent.id, uniqueParticipantIds)

    console.log(
      `OK: ${event.title} | ${event.date_time} | participants=${uniqueParticipantIds.length}`
    )
  }

  console.log('SEED EVENTS COMPLETED')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})