#!/usr/bin/env node

// Database agreement editor - CLI tool for editing agreement data directly
// Usage: node scripts/edit-agreement.js <agreement-id> [field] [value]

const { Pool } = require('pg')
const readline = require('readline')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve))
}

async function listAgreements() {
  try {
    const result = await pool.query(
      'SELECT id, label, agreement_type, created_at FROM agreements ORDER BY created_at DESC LIMIT 10'
    )
    console.log('\nRecent Agreements:')
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.label} (${row.agreement_type}) - ${row.id}`)
    })
  } catch (err) {
    console.error('Error listing agreements:', err.message)
  }
}

async function viewAgreement(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM agreements WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      console.log('Agreement not found')
      return null
    }
    const agr = result.rows[0]
    console.log('\n=== Agreement Details ===')
    console.log(`ID: ${agr.id}`)
    console.log(`Label: ${agr.label}`)
    console.log(`Type: ${agr.agreement_type}`)
    console.log(`Status: ${agr.status}`)
    console.log(`Created: ${agr.created_at}`)
    console.log(`Updated: ${agr.updated_at}`)
    console.log(`User: ${agr.user_id}`)
    console.log('\nInterview Data (first 1000 chars):')
    const dataStr = JSON.stringify(agr.interview_data, null, 2)
    console.log(dataStr.substring(0, 1000) + (dataStr.length > 1000 ? '...' : ''))
    return agr
  } catch (err) {
    console.error('Error fetching agreement:', err.message)
    return null
  }
}

async function updateLabel(id, newLabel) {
  try {
    await pool.query(
      'UPDATE agreements SET label = $1, updated_at = NOW() WHERE id = $2',
      [newLabel, id]
    )
    console.log('Label updated successfully')
  } catch (err) {
    console.error('Error updating label:', err.message)
  }
}

async function updateStatus(id, newStatus) {
  try {
    await pool.query(
      'UPDATE agreements SET status = $1, updated_at = NOW() WHERE id = $2',
      [newStatus, id]
    )
    console.log('Status updated successfully')
  } catch (err) {
    console.error('Error updating status:', err.message)
  }
}

async function updateInterviewData(id, key, value) {
  try {
    const result = await pool.query(
      'SELECT interview_data FROM agreements WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      console.log('Agreement not found')
      return
    }

    const data = result.rows[0].interview_data || {}
    data[key] = value === 'null' ? null : (value === 'true' ? true : (value === 'false' ? false : value))

    await pool.query(
      'UPDATE agreements SET interview_data = $1, updated_at = NOW() WHERE id = $2',
      [data, id]
    )
    console.log(`Updated interview_data.${key}`)
  } catch (err) {
    console.error('Error updating interview data:', err.message)
  }
}

async function deleteAgreement(id) {
  try {
    const confirm = await question('Are you sure you want to delete this agreement? (yes/no): ')
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled')
      return
    }
    await pool.query('DELETE FROM agreements WHERE id = $1', [id])
    console.log('Agreement deleted')
  } catch (err) {
    console.error('Error deleting agreement:', err.message)
  }
}

async function main() {
  console.log('=== Agreement Database Editor ===\n')

  while (true) {
    console.log('\nOptions:')
    console.log('1. List recent agreements')
    console.log('2. View agreement details')
    console.log('3. Update agreement label')
    console.log('4. Update agreement status')
    console.log('5. Update interview data field')
    console.log('6. Delete agreement')
    console.log('7. Exit')

    const choice = await question('\nSelect option (1-7): ')

    if (choice === '1') {
      await listAgreements()
    } else if (choice === '2') {
      const id = await question('Enter agreement ID: ')
      await viewAgreement(id)
    } else if (choice === '3') {
      const id = await question('Enter agreement ID: ')
      const label = await question('Enter new label: ')
      await updateLabel(id, label)
    } else if (choice === '4') {
      const id = await question('Enter agreement ID: ')
      const status = await question('Enter new status (draft/final): ')
      await updateStatus(id, status)
    } else if (choice === '5') {
      const id = await question('Enter agreement ID: ')
      const key = await question('Enter field name (e.g. party1Name): ')
      const value = await question('Enter new value: ')
      await updateInterviewData(id, key, value)
    } else if (choice === '6') {
      const id = await question('Enter agreement ID: ')
      await deleteAgreement(id)
    } else if (choice === '7') {
      console.log('Exiting...')
      break
    } else {
      console.log('Invalid option')
    }
  }

  rl.close()
  await pool.end()
}

main().catch(console.error)
