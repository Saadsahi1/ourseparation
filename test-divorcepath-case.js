// Test Case: Validate against DivorcePath results
// Input: Aaron $125,000, Person B $25,000, 10 years marriage, 3 kids, 2020 tax year

import { calculateTax } from './lib/calc/ontarioTax.js'

const testCase = {
  personAIncome: 125000,
  personBIncome: 25000,
  taxYear: 2020,
  children: [
    { residesWith: 'A', age: 12, dateOfBirth: '2008-01-01' },
    { residesWith: 'shared', age: 10, dateOfBirth: '2010-01-01' },
    { residesWith: 'B', age: 8, dateOfBirth: '2012-01-01' },
  ],
}

console.log('='.repeat(70))
console.log('DivorcePath Test Case #1')
console.log('='.repeat(70))
console.log('\nINPUT:')
console.log(`  Aaron (Person A): $${testCase.personAIncome.toLocaleString()}`)
console.log(`  Person B:         $${testCase.personBIncome.toLocaleString()}`)
console.log(`  Tax Year:         ${testCase.taxYear}`)
console.log(`  Children:         3 (Age 12 with A, Age 10 shared, Age 8 with B)`)

const familyNetIncome = testCase.personAIncome + testCase.personBIncome

console.log('\n' + '='.repeat(70))
console.log('AARON (Person A)')
console.log('='.repeat(70))

const aaronTax = calculateTax({
  grossIncome: testCase.personAIncome,
  supportReceived: 0,
  supportPaid: 0,
  children: testCase.children,
  parent: 'A',
  familyNetIncome: familyNetIncome,
  numDependents: 2, // Children 1 & 2
  taxYear: testCase.taxYear,
})

console.log('\nTAX CALCULATION:')
console.log(`  Federal Tax:        ${aaronTax.fedTaxPayable.toLocaleString()}`)
console.log(`  Ontario Tax:        ${aaronTax.ontTaxPayable.toLocaleString()}`)
console.log(`  Total Tax:          ${aaronTax.totalTax.toLocaleString()}`)
console.log(`  CPP:                ${aaronTax.cpp.total.toLocaleString()}`)
console.log(`  EI:                 ${aaronTax.ei.toLocaleString()}`)
console.log(`  Total Deductions:   ${aaronTax.totalDeductions.toLocaleString()}`)

console.log('\nBENEFITS:')
console.log(`  Canada Child Benefit:       ${aaronTax.benefits.ccb.toLocaleString()}`)
console.log(`  Canada Workers Benefit:     ${aaronTax.benefits.cwb.toLocaleString()}`)
console.log(`  GST/HST Credit:             ${aaronTax.benefits.gst.toLocaleString()}`)
console.log(`  Climate Action Incentive:   ${aaronTax.benefits.cai.toLocaleString()}`)
console.log(`  Ontario Child Benefit:      ${aaronTax.benefits.ocb.toLocaleString()}`)
console.log(`  Ontario Trillium Benefit:   ${aaronTax.benefits.otb.toLocaleString()}`)
console.log(`  Total Benefits:             ${aaronTax.benefits.total.toLocaleString()}`)

console.log('\nNET RESULT:')
console.log(`  Gross Income:              $${testCase.personAIncome.toLocaleString()}`)
console.log(`  Less: Taxes & Deductions:  $${aaronTax.totalDeductions.toLocaleString()}`)
console.log(`  Plus: Benefits:            $${aaronTax.benefits.total.toLocaleString()}`)
console.log(`  Net Disposable Income:     $${aaronTax.netDisposableIncome.toLocaleString()}`)
console.log(`  Annual (×12):              $${(aaronTax.netDisposableIncome * 12).toLocaleString()}`)

console.log('\n' + '='.repeat(70))
console.log('PERSON B')
console.log('='.repeat(70))

const personBTax = calculateTax({
  grossIncome: testCase.personBIncome,
  supportReceived: 0,
  supportPaid: 0,
  children: testCase.children,
  parent: 'B',
  familyNetIncome: familyNetIncome,
  numDependents: 2, // Children 2 & 3
  taxYear: testCase.taxYear,
})

console.log('\nTAX CALCULATION:')
console.log(`  Federal Tax:        ${personBTax.fedTaxPayable.toLocaleString()}`)
console.log(`  Ontario Tax:        ${personBTax.ontTaxPayable.toLocaleString()}`)
console.log(`  Total Tax:          ${personBTax.totalTax.toLocaleString()}`)
console.log(`  CPP:                ${personBTax.cpp.total.toLocaleString()}`)
console.log(`  EI:                 ${personBTax.ei.toLocaleString()}`)
console.log(`  Total Deductions:   ${personBTax.totalDeductions.toLocaleString()}`)

console.log('\nBENEFITS:')
console.log(`  Canada Child Benefit:       ${personBTax.benefits.ccb.toLocaleString()}`)
console.log(`  Canada Workers Benefit:     ${personBTax.benefits.cwb.toLocaleString()}`)
console.log(`  GST/HST Credit:             ${personBTax.benefits.gst.toLocaleString()}`)
console.log(`  Climate Action Incentive:   ${personBTax.benefits.cai.toLocaleString()}`)
console.log(`  Ontario Child Benefit:      ${personBTax.benefits.ocb.toLocaleString()}`)
console.log(`  Ontario Trillium Benefit:   ${personBTax.benefits.otb.toLocaleString()}`)
console.log(`  Total Benefits:             ${personBTax.benefits.total.toLocaleString()}`)

console.log('\nNET RESULT:')
console.log(`  Gross Income:              $${testCase.personBIncome.toLocaleString()}`)
console.log(`  Less: Taxes & Deductions:  $${personBTax.totalDeductions.toLocaleString()}`)
console.log(`  Plus: Benefits:            $${personBTax.benefits.total.toLocaleString()}`)
console.log(`  Net Disposable Income:     $${personBTax.netDisposableIncome.toLocaleString()}`)
console.log(`  Annual (×12):              $${(personBTax.netDisposableIncome * 12).toLocaleString()}`)

console.log('\n' + '='.repeat(70))
console.log('COMPARISON TO DIVORCEPATH')
console.log('='.repeat(70))

const expectedAaron = {
  federalTax: 18802,
  ontarioTax: 10254,
  ontarioSurtax: 948,
  healthPremium: 750,
  totalDeductions: 34825,
  netAnnual: 77457,
}

const expectedPersonB = {
  federalTax: -2869,
  ontarioTax: 287,
  totalDeductions: -895,
  netAnnual: 58180,
}

console.log('\nAARON:')
console.log(`  Federal Tax:                ${aaronTax.fedTaxPayable.toLocaleString().padEnd(8)} (expect ${expectedAaron.federalTax.toLocaleString()})`)
console.log(`  Ontario Tax:                ${aaronTax.ontTaxPayable.toLocaleString().padEnd(8)} (expect ${expectedAaron.ontarioTax.toLocaleString()})`)
console.log(`  Total Deductions:           ${aaronTax.totalDeductions.toLocaleString().padEnd(8)} (expect ${expectedAaron.totalDeductions.toLocaleString()})`)
console.log(`  Annual Net:                 $${(aaronTax.netDisposableIncome * 12).toLocaleString().padEnd(8)} (expect $${expectedAaron.netAnnual.toLocaleString()})`)

console.log('\nPERSON B:')
console.log(`  Federal Tax:                ${personBTax.fedTaxPayable.toLocaleString().padEnd(8)} (expect ${expectedPersonB.federalTax.toLocaleString()})`)
console.log(`  Ontario Tax:                ${personBTax.ontTaxPayable.toLocaleString().padEnd(8)} (expect ${expectedPersonB.ontarioTax.toLocaleString()})`)
console.log(`  Total Deductions:           ${personBTax.totalDeductions.toLocaleString().padEnd(8)} (expect ${expectedPersonB.totalDeductions.toLocaleString()})`)
console.log(`  Annual Net:                 $${(personBTax.netDisposableIncome * 12).toLocaleString().padEnd(8)} (expect $${expectedPersonB.netAnnual.toLocaleString()})`)

console.log('\n' + '='.repeat(70))
