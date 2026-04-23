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
    title: 'Пиво после работы',
    description:
      'Собираемся без официоза на пару бокалов, выдохнуть после дня и просто нормально пообщаться.',
    activity_type: 'food_drinks',
    join_mode: 'open',
    date_time: toIsoLocal(1, 18, 45),
    location: 'Strada Alexei Șciusev 86, Chișinău, Moldova',
    location_place_id: 'seed-sciusev-86',
    location_lat: 47.02434,
    location_lng: 28.82124,
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
    title: 'Ночевка в компьютерном клубе',
    description:
      'Сбор рядом с клубом, знакомимся, берем что по кайфу и залетаем на ночную сессию. Можно прийти даже одному.',
    activity_type: 'entertainment',
    join_mode: 'open',
    date_time: toIsoLocal(1, 22, 0),
    location: 'Strada Arborilor 21, Chișinău, Moldova',
    location_place_id: 'seed-arborilor-club-night',
    location_lat: 46.9901,
    location_lng: 28.8458,
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
    title: 'Прогулка в парке вечером',
    description:
      'Просто пройтись, поболтать и проветрить голову. Без спешки и без обязательств на весь вечер.',
    activity_type: 'outdoors',
    join_mode: 'open',
    date_time: toIsoLocal(2, 19, 10),
    location: 'Valea Morilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-morilor-2',
    location_lat: 47.0142,
    location_lng: 28.8198,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
    ],
  },
  {
    title: 'Кофе и поболтать',
    description:
      'Если хочется ненадолго выбраться в город и посидеть с кем-то вживую, можно пересечься на кофе.',
    activity_type: 'food_drinks',
    join_mode: 'open',
    date_time: toIsoLocal(2, 18, 20),
    location: 'Piața Marii Adunări Naționale 1, Chișinău, Moldova',
    location_place_id: 'seed-pman-coffee',
    location_lat: 47.0245,
    location_lng: 28.8323,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Настолки без душниловки',
    description:
      'Легкий вечер с простыми настолками. Подходит даже если давно не играл и просто хочешь компанию.',
    activity_type: 'entertainment',
    join_mode: 'open',
    date_time: toIsoLocal(3, 18, 30),
    location: 'Strada Vlaicu Pârcălab 45, Chișinău, Moldova',
    location_place_id: 'seed-parcalab-boardgames',
    location_lat: 47.0226,
    location_lng: 28.8351,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Футбол для своих и новых',
    description:
      'Играем в спокойном темпе, без токсика и лишнего напряга. Главное прийти и поймать движ.',
    activity_type: 'sports',
    join_mode: 'open',
    date_time: toIsoLocal(3, 20, 15),
    location: 'Strada Grenoble 191, Chișinău, Moldova',
    location_place_id: 'seed-grenoble-sports',
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
    title: 'Сходить на бургер и не думать ни о чем',
    description:
      'Небольшой спонтанный сбор поесть и пообщаться. Ничего сложного, просто живая встреча.',
    activity_type: 'food_drinks',
    join_mode: 'open',
    date_time: toIsoLocal(4, 19, 40),
    location: 'Boulevardul Ștefan cel Mare și Sfînt 124, Chișinău, Moldova',
    location_place_id: 'seed-stefan-burger',
    location_lat: 47.02664,
    location_lng: 28.81332,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
    ],
  },
  {
    title: 'Разговорный English meetup',
    description:
      'Собираемся немного попрактиковать английский в живом общении, без учебной атмосферы и стресса.',
    activity_type: 'study',
    join_mode: 'open',
    date_time: toIsoLocal(5, 18, 0),
    location: 'Strada Mitropolit Gavriil Bănulescu-Bodoni 61, Chișinău, Moldova',
    location_place_id: 'seed-bodoni-english',
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
    title: 'Субботний завтрак в городе',
    description:
      'Неспешный утренний сбор: кофе, еда, разговоры и нормальное начало выходного.',
    activity_type: 'food_drinks',
    join_mode: 'open',
    date_time: toIsoLocal(6, 10, 30),
    location: 'Strada Pușkin 24, Chișinău, Moldova',
    location_place_id: 'seed-puskin-breakfast',
    location_lat: 47.0287,
    location_lng: 28.8354,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.5@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Прогулка у озера',
    description:
      'Если хочется выйти из дома и спокойно пройтись у воды, можно собраться на легкий вечерний маршрут.',
    activity_type: 'outdoors',
    join_mode: 'open',
    date_time: toIsoLocal(6, 18, 20),
    location: 'Parcul Valea Trandafirilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-trandafirilor-walk',
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
    title: 'Тимбилдинг команды',
    description:
      'Камерная встреча для своей рабочей команды. Формат закрытый, по заявке, чтобы не превращать это в открытую тусовку.',
    activity_type: 'networking',
    join_mode: 'request',
    date_time: toIsoLocal(7, 18, 30),
    location: 'Strada Eugeniu Coca 37, Chișinău, Moldova',
    location_place_id: 'seed-eugen-coca-team',
    location_lat: 47.01861,
    location_lng: 28.80187,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.4@example.com',
    ],
  },
  {
    title: 'Встреча по пет-проектам',
    description:
      'Небольшой закрытый сбор, чтобы обсудить свои идеи и проекты в спокойном кругу.',
    activity_type: 'tech',
    join_mode: 'request',
    date_time: toIsoLocal(7, 20, 0),
    location: 'Boulevardul Ștefan cel Mare și Sfînt 124, Chișinău, Moldova',
    location_place_id: 'seed-stefan-tech',
    location_lat: 47.02664,
    location_lng: 28.81332,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.3@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.7@example.com',
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
      activity_type: event.activity_type,
      creator_id: creatorId,
      city: event.city,
      city_normalized: event.city_normalized,
      visibility: 'public',
      join_mode: event.join_mode ?? 'open',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function createEventPrivateDetails(eventId, event) {
  const { error } = await supabase.from('event_private_details').insert({
    event_id: eventId,
    date_time: event.date_time,
    location: event.location,
    location_place_id: event.location_place_id,
    location_lat: event.location_lat,
    location_lng: event.location_lng,
  })

  if (error) {
    throw error
  }
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
    await createEventPrivateDetails(createdEvent.id, event)
    await addParticipants(createdEvent.id, uniqueParticipantIds)

    console.log(
      `OK: ${event.title} | join_mode=${event.join_mode} | ${event.date_time} | participants=${uniqueParticipantIds.length}`
    )
  }

  console.log('SEED EVENTS COMPLETED')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
