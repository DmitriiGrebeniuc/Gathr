console.log('SCRIPT STARTED')

import { createClient } from '@supabase/supabase-js'
import process from 'node:process'

const supabaseUrl = process.env.SUPABASE_URL
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

const testUsers = [
  {
    email: 'gathr.seed.1@example.com',
    password: 'TestUser123!',
    name: 'Alex',
  },
  {
    email: 'gathr.seed.2@example.com',
    password: 'TestUser123!',
    name: 'Maria',
  },
  {
    email: 'gathr.seed.3@example.com',
    password: 'TestUser123!',
    name: 'Nikita',
  },
  {
    email: 'gathr.seed.4@example.com',
    password: 'TestUser123!',
    name: 'Elena',
  },
  {
    email: 'gathr.seed.5@example.com',
    password: 'TestUser123!',
    name: 'Denis',
  },
  {
    email: 'gathr.seed.6@example.com',
    password: 'TestUser123!',
    name: 'Andrei',
  },
  {
    email: 'gathr.seed.7@example.com',
    password: 'TestUser123!',
    name: 'Cristina',
  },
  {
    email: 'gathr.seed.8@example.com',
    password: 'TestUser123!',
    name: 'Victor',
  },
]

async function findAuthUserByEmail(email) {
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw error
    }

    const found = data.users.find((user) => user.email === email)
    if (found) {
      return found
    }

    if (data.users.length < perPage) {
      return null
    }

    page += 1
  }
}

async function ensureAuthUser(user) {
  const existingUser = await findAuthUserByEmail(user.email)

  if (existingUser) {
    return existingUser
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      name: user.name,
    },
  })

  if (error) {
    throw error
  }

  return data.user
}

async function ensureProfile(authUser, user) {
  const profilePayload = {
    id: authUser.id,
    name: user.name,
    role: 'user',
    plan: 'free',
    has_unlimited_access: false,
    is_banned: false,
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

async function main() {
    console.log('MAIN START')
  for (const user of testUsers) {
    console.log('Processing:', user.email)
    try {
      const authUser = await ensureAuthUser(user)
      await ensureProfile(authUser, user)

      console.log(`OK: ${user.email} -> ${authUser.id}`)
    } catch (error) {
      console.error(`FAILED: ${user.email}`)
      console.error(error)
    }
  }

  console.log('Seed completed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})