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
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const curatedEvents = [
  {
    title: 'Кофе после работы',
    description: 'Спокойно собираемся на кофе, знакомимся и общаемся без спешки.',
    activity_type: 'networking',
    date_time: toIsoLocal(1, 19, 0),
    location: 'Strada Arborilor 21, Chișinău, Moldova',
    location_place_id: 'seed-arborilor-21',
    location_lat: 46.9901,
    location_lng: 28.8458,
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
    title: 'Прогулка в Valea Morilor',
    description: 'Неспешная вечерняя прогулка вокруг озера. Можно просто прийти и пройтись круг.',
    activity_type: 'sport',
    date_time: toIsoLocal(2, 18, 30),
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
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Мини-футбол на Ботанике',
    description: 'Ищем ещё пару человек на лёгкий футбол без жёсткой игры.',
    activity_type: 'sport',
    date_time: toIsoLocal(3, 20, 0),
    location: 'Bd. Dacia 45, Chișinău, Moldova',
    location_place_id: 'seed-dacia-45',
    location_lat: 46.9897,
    location_lng: 28.8573,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Настолки в центре',
    description: 'Берём простые настольные игры, садимся и знакомимся. Подойдёт и новичкам.',
    activity_type: 'networking',
    date_time: toIsoLocal(4, 19, 30),
    location: 'Piața Marii Adunări Naționale 1, Chișinău, Moldova',
    location_place_id: 'seed-pman-1',
    location_lat: 47.0245,
    location_lng: 28.8323,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.7@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Нетворкинг в кафе',
    description: 'Мини-встреча для общения, новых контактов и обсуждения идей.',
    activity_type: 'networking',
    date_time: toIsoLocal(5, 18, 45),
    location: 'Strada Alexei Șciusev 62, Chișinău, Moldova',
    location_place_id: 'seed-sciusev-62',
    location_lat: 47.0218,
    location_lng: 28.8249,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Прогулка по Дендрарию',
    description: 'Лёгкая прогулка без спешки. Можно прийти даже одному, формат очень простой.',
    activity_type: 'sport',
    date_time: toIsoLocal(6, 17, 0),
    location: 'Parcul Dendrariu, Chișinău, Moldova',
    location_place_id: 'seed-dendrarium',
    location_lat: 47.031,
    location_lng: 28.8012,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Вечерний кофе в центре',
    description: 'Короткая встреча после работы. Без сложного плана, просто собраться и пообщаться.',
    activity_type: 'coffee',
    date_time: toIsoLocal(7, 19, 15),
    location: 'Strada 31 August 1989 117, Chișinău, Moldova',
    location_place_id: 'seed-31-august-117',
    location_lat: 47.0241,
    location_lng: 28.8375,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Встреча по учебе',
    description: 'Собираемся обсудить учебу, языки и полезные ресурсы. Спокойный формат.',
    activity_type: 'education',
    date_time: toIsoLocal(8, 18, 0),
    location: 'Strada Mitropolit Gavriil Bănulescu-Bodoni 61, Chișinău, Moldova',
    location_place_id: 'seed-bodoni-61',
    location_lat: 47.0282,
    location_lng: 28.8357,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Короткая встреча на выходных',
    description: 'Небольшая встреча в выходной день. Формат свободный, можно присоединиться без подготовки.',
    activity_type: 'networking',
    date_time: toIsoLocal(9, 12, 30),
    location: 'Strada Vlaicu Pârcălab 45, Chișinău, Moldova',
    location_place_id: 'seed-parcalab-45',
    location_lat: 47.0226,
    location_lng: 28.8351,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Вечерняя прогулка и разговоры',
    description: 'Спокойный формат для тех, кто хочет выйти пройтись и пообщаться.',
    activity_type: 'walk',
    date_time: toIsoLocal(10, 18, 40),
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
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Кофе и идеи по проектам',
    description: 'Для тех, кто любит обсуждать идеи, приложения, работу и новые задумки.',
    activity_type: 'networking',
    date_time: toIsoLocal(11, 19, 10),
    location: 'Strada Pușkin 24, Chișinău, Moldova',
    location_place_id: 'seed-puskin-24',
    location_lat: 47.0287,
    location_lng: 28.8354,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.7@example.com',
      'gathr.seed.8@example.com',
    ],
  },
  {
    title: 'Футбол для своих',
    description: 'Собираемся без жёсткого уровня. Главное прийти и поиграть.',
    activity_type: 'sport',
    date_time: toIsoLocal(12, 20, 15),
    location: 'Strada Grenoble 191, Chișinău, Moldova',
    location_place_id: 'seed-grenoble-191',
    location_lat: 46.9756,
    location_lng: 28.8579,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.4@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.6@example.com',
      'gathr.seed.8@example.com',
    ],
  },
]

async function loadProfilesForSeedUsers() {
  const emails = seedUsers.map((user) => user.email.toLowerCase())

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    throw authError
  }

  const matchedAuthUsers = authUsers.users.filter((user) =>
    user.email && emails.includes(user.email.toLowerCase())
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
      `OK: ${event.title} | creator=${creator.email} | participants=${uniqueParticipantIds.length}`
    )
  }

  console.log('SEED EVENTS COMPLETED')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})