import assert from 'node:assert/strict'
import {
  calculateDrinkSugar,
  getDrinkSugarStatus,
  evaluateDrinkSugar,
  sumKnownSugar
} from '../app/utils/sugar-calculation.ts'

console.log('🧪 Running Unit Tests for Sugar Calculation Logic...\n')

// Test 1: Example from requirements: 8g / 100ml, 350ml = 28g
{
  const result = calculateDrinkSugar(8, 350)
  assert.equal(result, 28, '8g per 100ml in 350ml should equal 28g')
  console.log('✅ Test 1 Passed: Standard calculation (8g/100ml * 350ml = 28g)')
}

// Test 2: Standard calculation with decimals: 7.3g / 100ml, 220ml = 16.1g
{
  const result = calculateDrinkSugar(7.3, 220)
  assert.equal(result, 16.1, '7.3g per 100ml in 220ml should equal 16.1g')
  console.log('✅ Test 2 Passed: Decimal rounding (7.3g/100ml * 220ml = 16.1g)')
}

// Test 3: Zero sugar drink (e.g. green tea / mineral water): 0g / 100ml, 500ml = 0g
{
  const result = calculateDrinkSugar(0, 500)
  assert.equal(result, 0, 'Zero sugar drink should yield 0g')
  console.log('✅ Test 3 Passed: Zero sugar drinks properly return 0g')
}

// Test 4: Unknown sugar (null): should return NULL, NEVER 0!
{
  const resultNull = calculateDrinkSugar(null, 450)
  assert.equal(resultNull, null, 'Unknown sugar (null) must return null, not 0')

  const resultUndefined = calculateDrinkSugar(undefined, 300)
  assert.equal(resultUndefined, null, 'Unknown sugar (undefined) must return null, not 0')

  const evalResult = evaluateDrinkSugar(null, 450)
  assert.equal(evalResult.isKnown, false)
  assert.equal(evalResult.totalSugarGrams, null)
  assert.equal(evalResult.status, 'Tidak Diketahui')
  console.log('✅ Test 4 Passed: Unknown sugar content strictly returns null and status "Tidak Diketahui"')
}

// Test 5: Validation - Non-positive volume must throw error
{
  assert.throws(
    () => calculateDrinkSugar(5, 0),
    /Volume minuman harus berupa angka positif/,
    'Volume 0ml should throw error'
  )
  assert.throws(
    () => calculateDrinkSugar(5, -100),
    /Volume minuman harus berupa angka positif/,
    'Negative volume should throw error'
  )
  console.log('✅ Test 5 Passed: Invalid volumes (0 or negative) throw error')
}

// Test 6: Validation - Negative sugar content must throw error
{
  assert.throws(
    () => calculateDrinkSugar(-2, 250),
    /Kandungan gula tidak boleh negatif/,
    'Negative sugar should throw error'
  )
  console.log('✅ Test 6 Passed: Negative sugar values throw error')
}

// Test 7: Status Categorization
{
  assert.equal(getDrinkSugarStatus(0), 'Aman')
  assert.equal(getDrinkSugarStatus(12), 'Aman')
  assert.equal(getDrinkSugarStatus(12.1), 'Waspada')
  assert.equal(getDrinkSugarStatus(25), 'Waspada')
  assert.equal(getDrinkSugarStatus(25.1), 'Melebihi Batas')
  assert.equal(getDrinkSugarStatus(null), 'Tidak Diketahui')
  console.log('✅ Test 7 Passed: Status bands (Aman <= 12, Waspada <= 25, Melebihi Batas > 25, Unknown)')
}

// Test 8: Summing known sugars with unknown items
{
  const items = [
    { totalSugarGrams: 15.0 },
    { totalSugarGrams: null }, // Unknown
    { totalSugarGrams: 0 },
    { totalSugarGrams: 14.0 }
  ]
  const summary = sumKnownSugar(items)
  assert.equal(summary.totalSugarGrams, 29.0, 'Total known sugar should be 15 + 0 + 14 = 29.0g')
  assert.equal(summary.knownCount, 3, 'Known count should be 3')
  assert.equal(summary.unknownCount, 1, 'Unknown count should be 1')
  console.log('✅ Test 8 Passed: Summing known sugars accurately isolates unknown entries without false zeros')
}

console.log('\n🎉 ALL 8 UNIT TESTS PASSED SUCCESSFULLY!')

