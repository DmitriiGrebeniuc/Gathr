import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import process from 'node:process'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
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

const seedUsers = JSON.parse(fs.readFileSync('./scripts/test-users.json', 'utf-8'))

const SEED_PLACE_PREFIX = 'gathr-seed-'

const places = {
  pman: {
    location: 'Piata Marii Adunari Nationale, Chisinau, Moldova',
    lat: 47.0245,
    lng: 28.8323,
  },
  centralPark: {
    location: 'Stefan cel Mare Central Park, Bulevardul Stefan cel Mare si Sfant 152, Chisinau, Moldova',
    lat: 47.0252,
    lng: 28.8303,
  },
  valeaMorilor: {
    location: 'Valea Morilor Park, Chisinau, Moldova',
    lat: 47.0142,
    lng: 28.8198,
  },
  roseValley: {
    location: 'Valea Trandafirilor Park, Chisinau, Moldova',
    lat: 46.998,
    lng: 28.8494,
  },
  dendrarium: {
    location: 'Dendrarium Park, Strada Ion Creanga 1, Chisinau, Moldova',
    lat: 47.0237,
    lng: 28.7923,
  },
  artcor: {
    location: 'Artcor, Strada 31 August 1989 137, Chisinau, Moldova',
    lat: 47.0254,
    lng: 28.8284,
  },
  tekwill: {
    location: 'Tekwill, Strada Studentilor 9/11, Chisinau, Moldova',
    lat: 47.0606,
    lng: 28.8676,
  },
  nationalLibrary: {
    location: 'National Library of Moldova, Strada 31 August 1989 78A, Chisinau, Moldova',
    lat: 47.0224,
    lng: 28.8352,
  },
  zimbru: {
    location: 'Zimbru Stadium, Bulevardul Dacia 45, Chisinau, Moldova',
    lat: 46.9814,
    lng: 28.868,
  },
  malldova: {
    location: 'Shopping MallDova, Strada Arborilor 21, Chisinau, Moldova',
    lat: 46.9902,
    lng: 28.8458,
  },
}

function seedEmail(index) {
  return `gathr.seed.${index}@example.com`
}

function toIsoLocal(daysFromNow, hour, minute = 0) {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMilliseconds(0)
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function event({
  slug,
  title,
  description,
  activityType,
  daysFromNow,
  hour,
  minute = 0,
  place,
  creator,
  participants,
  joinMode = 'open',
  city = 'Chișinău',
  cityNormalized = 'chisinau',
}) {
  const resolvedPlace = places[place]

  if (!resolvedPlace) {
    throw new Error(`Unknown seed place: ${place}`)
  }

  return {
    slug,
    title,
    description,
    activity_type: activityType,
    join_mode: joinMode,
    date_time: toIsoLocal(daysFromNow, hour, minute),
    location: resolvedPlace.location,
    location_place_id: `${SEED_PLACE_PREFIX}${slug}`,
    location_lat: resolvedPlace.lat,
    location_lng: resolvedPlace.lng,
    city,
    city_normalized: cityNormalized,
    creatorEmail: seedEmail(creator),
    participantEmails: participants.map(seedEmail),
  }
}

const curatedEvents = [
  event({
    slug: 'future-football-open',
    title: 'Футбол после работы на Zimbru',
    description:
      'Закрытый тренировочный сбор для своих и новых ребят по заявке. Формат спокойный, без жесткой соревновательности.',
    activityType: 'sports',
    daysFromNow: 1,
    hour: 19,
    place: 'zimbru',
    creator: 1,
    participants: [2, 3, 5, 8, 10, 11, 14, 17],
    joinMode: 'request',
  }),
  event({
    slug: 'future-rooftop-networking',
    title: 'Встреча фрилансеров и маленьких команд',
    description:
      'Небольшая встреча по заявке для людей, которые делают проекты, ищут партнеров или хотят спокойно познакомиться.',
    activityType: 'networking',
    daysFromNow: 2,
    hour: 18,
    minute: 30,
    place: 'artcor',
    creator: 2,
    participants: [1, 4, 7, 9, 12, 15, 18],
    joinMode: 'request',
  }),
  event({
    slug: 'future-board-games',
    title: 'Настолки без шумной тусовки',
    description:
      'Закрытый стол по заявке: простые игры, понятные правила и спокойная компания без случайной толпы.',
    activityType: 'entertainment',
    daysFromNow: 3,
    hour: 18,
    place: 'nationalLibrary',
    creator: 3,
    participants: [1, 2, 5, 6, 11, 16],
    joinMode: 'request',
  }),
  event({
    slug: 'future-english-coffee',
    title: 'Практика английского за кофе',
    description:
      'Небольшая группа по заявке: разговорный английский, кофе и живое общение без учебной атмосферы.',
    activityType: 'study',
    daysFromNow: 4,
    hour: 17,
    minute: 45,
    place: 'pman',
    creator: 4,
    participants: [2, 6, 8, 10, 13],
    joinMode: 'request',
  }),
  event({
    slug: 'future-tech-pet-projects',
    title: 'Вечер pet-проектов в Tekwill',
    description:
      'Закрытая встреча по заявке для тех, кто хочет показать идею, демо или обсудить маленький технический проект.',
    activityType: 'tech',
    daysFromNow: 5,
    hour: 19,
    place: 'tekwill',
    creator: 5,
    participants: [1, 3, 7, 12, 14],
    joinMode: 'request',
  }),
  event({
    slug: 'future-lake-walk',
    title: 'Прогулка у озера Valea Morilor',
    description:
      'Небольшая прогулка по заявке: свежий воздух, спокойный темп и безопасный состав участников.',
    activityType: 'outdoors',
    daysFromNow: 1,
    hour: 20,
    place: 'valeaMorilor',
    creator: 6,
    participants: [4, 8, 9, 13],
    joinMode: 'request',
  }),
  event({
    slug: 'future-breakfast-club',
    title: 'Завтрак выходного дня',
    description:
      'Кофе, еда и спокойное начало выходного. Событие по заявке, чтобы группа оставалась маленькой.',
    activityType: 'food_drinks',
    daysFromNow: 6,
    hour: 10,
    minute: 30,
    place: 'centralPark',
    creator: 7,
    participants: [1, 5, 10, 12, 18],
    joinMode: 'request',
  }),
  event({
    slug: 'future-botanica-burgers',
    title: 'Бургеры в MallDova',
    description:
      'Небольшая встреча по заявке: поесть, поговорить и познакомиться без ощущения большого мероприятия.',
    activityType: 'food_drinks',
    daysFromNow: 7,
    hour: 19,
    place: 'malldova',
    creator: 8,
    participants: [2, 3, 6, 11],
    joinMode: 'request',
  }),
  event({
    slug: 'future-film-night',
    title: 'Вечер кино в центре',
    description:
      'Выбираем фильм вместе, смотрим и немного обсуждаем после. Открытый тестовый формат, но место указано точно.',
    activityType: 'entertainment',
    daysFromNow: 8,
    hour: 20,
    place: 'artcor',
    creator: 9,
    participants: [4, 7, 15],
  }),
  event({
    slug: 'future-study-sprint',
    title: 'Учебный спринт на два часа',
    description:
      'Приходи с ноутбуком или конспектом. Тихие фокус-блоки, короткие паузы и кофе после.',
    activityType: 'study',
    daysFromNow: 9,
    hour: 16,
    place: 'nationalLibrary',
    creator: 10,
    participants: [1, 13, 16, 19],
  }),
  event({
    slug: 'future-closed-team-dinner',
    title: 'Ужин маленькой командой',
    description:
      'Закрытый ужин по заявке для тех, кто хочет тихий стол, понятный состав и нормальное общение.',
    activityType: 'networking',
    daysFromNow: 10,
    hour: 19,
    minute: 30,
    place: 'malldova',
    creator: 11,
    participants: [2, 5, 14],
    joinMode: 'request',
  }),
  event({
    slug: 'future-other-city-ideas',
    title: 'Idei pentru oraș',
    description:
      'O întâlnire deschisă pentru idei despre locuri, obiceiuri, evenimente și lucruri utile în Chișinău.',
    activityType: 'other',
    daysFromNow: 11,
    hour: 18,
    place: 'pman',
    creator: 12,
    participants: [3, 6, 9, 17],
  }),

  event({
    slug: 'recent-sunday-run',
    title: 'Утренняя пробежка в парке',
    description:
      'Прошедшая легкая пробежка: спокойный темп, хорошая погода и несколько новых знакомств.',
    activityType: 'sports',
    daysFromNow: -1,
    hour: 9,
    place: 'roseValley',
    creator: 13,
    participants: [1, 2, 4, 7, 10, 16],
  }),
  event({
    slug: 'recent-coffee-intros',
    title: 'Кофе-знакомство для новичков',
    description:
      'Люди, недавно приехавшие в город, встретились на кофе, познакомились и обменялись полезными местами.',
    activityType: 'networking',
    daysFromNow: -2,
    hour: 18,
    place: 'centralPark',
    creator: 14,
    participants: [3, 5, 8, 11, 12],
  }),
  event({
    slug: 'recent-open-mic',
    title: 'Mic deschis la Artcor',
    description:
      'O seară mică de open mic: cântece, povești și oameni care au încercat ceva nou.',
    activityType: 'entertainment',
    daysFromNow: -3,
    hour: 20,
    place: 'artcor',
    creator: 15,
    participants: [1, 4, 6, 9, 18, 20],
  }),
  event({
    slug: 'recent-js-debug',
    title: 'Разбор JavaScript-багов',
    description:
      'Разработчики принесли реальные баги и спокойно разобрали их вместе. Практично и неожиданно весело.',
    activityType: 'tech',
    daysFromNow: -4,
    hour: 19,
    place: 'tekwill',
    creator: 16,
    participants: [2, 5, 7, 10, 13, 17],
  }),
  event({
    slug: 'recent-picnic',
    title: 'Пикник в Valea Morilor',
    description:
      'Обычный пикник с пледами, закусками и разговорами, которые затянулись дольше плана.',
    activityType: 'outdoors',
    daysFromNow: -5,
    hour: 17,
    place: 'valeaMorilor',
    creator: 17,
    participants: [3, 4, 8, 11, 14, 19],
  }),
  event({
    slug: 'recent-ramen-night',
    title: 'Вечер рамена',
    description:
      'Еда после работы для тех, кому хотелось чего-то теплого, простого и социального.',
    activityType: 'food_drinks',
    daysFromNow: -6,
    hour: 19,
    place: 'malldova',
    creator: 18,
    participants: [1, 6, 9, 12, 15, 20],
  }),
  event({
    slug: 'recent-book-swap',
    title: 'Обмен книгами у библиотеки',
    description:
      'Каждый принес одну книгу и ушел с другой. Самым ценным оказались рекомендации и разговоры.',
    activityType: 'study',
    daysFromNow: -7,
    hour: 16,
    place: 'nationalLibrary',
    creator: 19,
    participants: [2, 7, 10, 13, 16],
  }),
  event({
    slug: 'recent-closed-product-chat',
    title: 'Разговор о продуктовых идеях',
    description:
      'Прошедшая открытая встреча про продуктовые идеи, честный фидбек и первые пользовательские сценарии.',
    activityType: 'tech',
    daysFromNow: -8,
    hour: 18,
    place: 'tekwill',
    creator: 20,
    participants: [3, 5, 11, 14],
  }),

  event({
    slug: 'popular-city-quest',
    title: 'Городской квест по центру',
    description:
      'Прошедший квест по знакомым улицам: маленькие команды, неожиданные задания и много смеха.',
    activityType: 'outdoors',
    daysFromNow: -18,
    hour: 14,
    place: 'pman',
    creator: 1,
    participants: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  }),
  event({
    slug: 'popular-startup-breakfast',
    title: 'Завтрак про стартапы',
    description:
      'Прошедший завтрак, где фаундеры, дизайнеры и просто любопытные люди рассказывали, что строят.',
    activityType: 'networking',
    daysFromNow: -21,
    hour: 10,
    place: 'centralPark',
    creator: 2,
    participants: [1, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  }),
  event({
    slug: 'popular-volleyball',
    title: 'Волейбол в парке',
    description:
      'Прошедший спортивный вечер, который растянулся на несколько раундов, потому что пришло больше людей, чем ожидали.',
    activityType: 'sports',
    daysFromNow: -25,
    hour: 18,
    place: 'roseValley',
    creator: 3,
    participants: [1, 2, 5, 7, 9, 11, 13, 15, 17, 19],
  }),
  event({
    slug: 'popular-food-tour',
    title: 'Mic tur gastronomic',
    description:
      'Un tur deja încheiat prin câteva locuri din oraș, cu farfurii împărțite și discuții despre deserturi.',
    activityType: 'food_drinks',
    daysFromNow: -32,
    hour: 17,
    place: 'malldova',
    creator: 4,
    participants: [2, 3, 5, 6, 8, 9, 12, 14, 15, 18],
  }),
  event({
    slug: 'popular-retro-games',
    title: 'Вечер ретро-игр',
    description:
      'Прошедший вечер старых игр, дружеского соревнования и нулевой серьезности.',
    activityType: 'entertainment',
    daysFromNow: -40,
    hour: 20,
    place: 'artcor',
    creator: 5,
    participants: [1, 4, 6, 7, 10, 11, 13, 16, 17],
  }),
  event({
    slug: 'popular-language-potluck',
    title: 'Language potluck la bibliotecă',
    description:
      'Schimb lingvistic deja încheiat: fiecare a adus o gustare și o expresie din altă limbă.',
    activityType: 'study',
    daysFromNow: -48,
    hour: 18,
    place: 'nationalLibrary',
    creator: 6,
    participants: [2, 4, 5, 8, 12, 15, 18, 19, 20],
  }),
]

async function loadProfilesForSeedUsers() {
  const emails = seedUsers.map((user) => user.email.toLowerCase())

  const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers({
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
      matchedAuthUsers.map((user) => user.email)
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
    const profile = profiles.find((item) => item.id === authUser.id)
    if (!profile) continue

    byEmail[authUser.email.toLowerCase()] = {
      id: authUser.id,
      email: authUser.email.toLowerCase(),
      name: profile.name,
    }
  }

  return byEmail
}

async function deleteRows(table, column, values) {
  if (values.length === 0) {
    return
  }

  const { error } = await supabase.from(table).delete().in(column, values)

  if (error) {
    throw error
  }
}

async function cleanupPreviousSeedEvents() {
  const { data: privateRows, error } = await supabase
    .from('event_private_details')
    .select('event_id, location_place_id')
    .like('location_place_id', `${SEED_PLACE_PREFIX}%`)

  if (error) {
    throw error
  }

  const eventIds = ((privateRows || []).map((row) => row.event_id).filter(Boolean))

  if (eventIds.length === 0) {
    return
  }

  console.log(`Cleaning previous seed events: ${eventIds.length}`)

  await deleteRows('event_contact_methods', 'event_id', eventIds)
  await deleteRows('event_join_requests', 'event_id', eventIds)
  await deleteRows('participants', 'event_id', eventIds)
  await deleteRows('event_private_details', 'event_id', eventIds)
  await deleteRows('events', 'id', eventIds)
}

async function createEvent(eventData, creatorId) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      description: eventData.description,
      activity_type: eventData.activity_type,
      creator_id: creatorId,
      city: eventData.city,
      city_normalized: eventData.city_normalized,
      visibility: 'public',
      join_mode: eventData.join_mode ?? 'open',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

async function createEventPrivateDetails(eventId, eventData) {
  const { error } = await supabase.from('event_private_details').insert({
    event_id: eventId,
    date_time: eventData.date_time,
    location: eventData.location,
    location_place_id: eventData.location_place_id,
    location_lat: eventData.location_lat,
    location_lng: eventData.location_lng,
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

function resolveParticipantIds(eventData, usersByEmail) {
  const creator = usersByEmail[eventData.creatorEmail.toLowerCase()]

  if (!creator) {
    throw new Error(`Creator not found: ${eventData.creatorEmail}`)
  }

  const participantIds = [
    creator.id,
    ...eventData.participantEmails.map((email) => {
      const user = usersByEmail[email.toLowerCase()]

      if (!user) {
        throw new Error(`Participant not found: ${email}`)
      }

      return user.id
    }),
  ]

  return {
    creator,
    participantIds: [...new Set(participantIds)],
  }
}

async function main() {
  console.log('SEED EVENTS STARTED')
  console.log(`Seed users loaded: ${seedUsers.length}`)
  console.log(`Curated events planned: ${curatedEvents.length}`)

  const usersByEmail = await loadProfilesForSeedUsers()
  await cleanupPreviousSeedEvents()

  for (const eventData of curatedEvents) {
    const { creator, participantIds } = resolveParticipantIds(eventData, usersByEmail)

    const createdEvent = await createEvent(eventData, creator.id)
    await createEventPrivateDetails(createdEvent.id, eventData)
    await addParticipants(createdEvent.id, participantIds)

    console.log(
      `OK: ${eventData.slug} | ${eventData.activity_type} | ${eventData.join_mode} | ${eventData.date_time} | participants=${participantIds.length}`
    )
  }

  console.log('SEED EVENTS COMPLETED')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
