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
    title: 'Кофе, мемы и пять минут выдохнуть',
    description:
      'После работы залетаем на быстрый кофе без формальностей. Можно просто прийти, переключиться с дел и поболтать обо всём подряд.',
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
    title: 'Закат, плейлист и прогулка без спешки',
    description:
      'Идем гулять ближе к вечеру, берем любимые треки в наушники и просто выходим из режима “дом-работа-дом”.',
    activity_type: 'outdoors',
    join_mode: 'open',
    date_time: toIsoLocal(1, 20, 10),
    location: 'Valea Morilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-morilor-2',
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
    title: 'Мини-брейншторм для своих и новых людей',
    description:
      'Собираемся обсудить идеи, маленькие проекты, пет-фичи и всё, что давно хотелось кому-то показать. Без пафоса и питчей.',
    activity_type: 'tech',
    join_mode: 'open',
    date_time: toIsoLocal(2, 19, 30),
    location: 'Piața Marii Adunări Naționale 1, Chișinău, Moldova',
    location_place_id: 'seed-pman-tech',
    location_lat: 47.0245,
    location_lng: 28.8323,
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
    title: 'Языковой спот: English + румынский вживую',
    description:
      'Без учебника и без стресса: знакомимся, говорим, тупим, смеемся и пробуем вытащить живую практику из обычного общения.',
    activity_type: 'study',
    join_mode: 'open',
    date_time: toIsoLocal(3, 12, 30),
    location: 'Strada Mitropolit Gavriil Bănulescu-Bodoni 61, Chișinău, Moldova',
    location_place_id: 'seed-bodoni-study',
    location_lat: 47.0282,
    location_lng: 28.8357,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Локальный afterwork для тех, кто устал от чатов',
    description:
      'Небольшая живая встреча после работы. Формат камерный: без толпы, без “а чем ты занимаешься?” в первые десять секунд.',
    activity_type: 'networking',
    join_mode: 'request',
    date_time: toIsoLocal(3, 19, 0),
    location: 'Strada Eugeniu Coca 37, Chișinău, Moldova',
    location_place_id: 'seed-eugen-coca',
    location_lat: 47.01861,
    location_lng: 28.80187,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.4@example.com',
      'gathr.seed.5@example.com',
    ],
  },
  {
    title: 'Мячик без токсика',
    description:
      'Вечером играем в футбол в легком темпе: без жести, без разборов, просто задвигаться и поймать настроение.',
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
    title: 'Настолки + чай + “еще одну катку”',
    description:
      'Собираем маленькую компанию на настолки без суперсложных правил. Можно прийти даже если давно не играл и просто хочешь живого вечера.',
    activity_type: 'entertainment',
    join_mode: 'open',
    date_time: toIsoLocal(5, 17, 50),
    location: 'Strada Vlaicu Pârcălab 45, Chișinău, Moldova',
    location_place_id: 'seed-parcalab-games',
    location_lat: 47.0226,
    location_lng: 28.8351,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.1@example.com',
    participantEmails: [
      'gathr.seed.2@example.com',
      'gathr.seed.4@example.com',
      'gathr.seed.7@example.com',
    ],
  },
  {
    title: 'Тихий пикник и нормальные разговоры',
    description:
      'Хочется собраться без шума и случайной суеты. Берем снеки, плед и делаем простой уличный вечер для своего круга и новых лиц.',
    activity_type: 'outdoors',
    join_mode: 'request',
    date_time: toIsoLocal(5, 18, 40),
    location: 'Parcul Dendrariu, Chișinău, Moldova',
    location_place_id: 'seed-dendrarium-picnic',
    location_lat: 47.031,
    location_lng: 28.8012,
    city: 'Chișinău',
    city_normalized: 'chisinau',
    creatorEmail: 'gathr.seed.2@example.com',
    participantEmails: [
      'gathr.seed.1@example.com',
      'gathr.seed.6@example.com',
    ],
  },
  {
    title: 'Кофе и разбор карьерных качелей',
    description:
      'Если хочется выговориться про работу, смену направления, выгорание или просто свериться с людьми — приходите, формат очень человеческий.',
    activity_type: 'networking',
    join_mode: 'open',
    date_time: toIsoLocal(6, 13, 10),
    location: 'Strada Pușkin 24, Chișinău, Moldova',
    location_place_id: 'seed-puskin-career',
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
    title: 'Пятничный вайб на свежем воздухе',
    description:
      'Встречаемся в парке, чтобы просто сменить картинку, пройтись, поболтать и не откладывать жизнь “на потом”.',
    activity_type: 'outdoors',
    join_mode: 'open',
    date_time: toIsoLocal(6, 18, 20),
    location: 'Parcul Valea Trandafirilor, Chișinău, Moldova',
    location_place_id: 'seed-valea-trandafirilor-vibe',
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
    title: 'Кино, попкорн и без спойлеров',
    description:
      'Небольшой сбор на совместный кино-план. Можно сначала пересечься, решить сеанс на месте и потом уже двигаться дальше вместе.',
    activity_type: 'entertainment',
    join_mode: 'open',
    date_time: toIsoLocal(7, 19, 10),
    location: 'Strada Arborilor 21, Chișinău, Moldova',
    location_place_id: 'seed-arborilor-cinema',
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
  {
    title: 'Вечер для тех, кто делает что-то свое',
    description:
      'Маленькая встреча для людей с личными идеями, микро-проектами и странными задумками, которые хочется обсудить без кринжа.',
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
