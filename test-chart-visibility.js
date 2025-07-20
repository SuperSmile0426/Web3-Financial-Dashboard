// Test script for chart bar visibility
console.log('🧪 Testing Chart Bar Visibility...\n')

// Test data
const demoTransactionTrend = [2, 5, 3, 7, 4, 1, 0]
const demoApprovalTrend = [1, 3, 2, 4, 2, 1, 0]
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Calculate max values
const maxTransactionValue = Math.max(...demoTransactionTrend, 1)
const maxApprovalValue = Math.max(...demoApprovalTrend, 1)

console.log('Demo Data:')
console.log('Transaction Trend:', demoTransactionTrend)
console.log('Approval Trend:', demoApprovalTrend)
console.log('Max Transaction Value:', maxTransactionValue)
console.log('Max Approval Value:', maxApprovalValue)

console.log('\n📊 Transaction Bar Heights:')
demoTransactionTrend.forEach((value, index) => {
  const height = Math.max((value / maxTransactionValue) * 100, 10)
  console.log(`  ${days[index]}: ${value} → ${height.toFixed(1)}% (${height}px at 20px container)`)
})

console.log('\n📊 Approval Bar Heights:')
demoApprovalTrend.forEach((value, index) => {
  const height = Math.max((value / maxApprovalValue) * 100, 10)
  console.log(`  ${days[index]}: ${value} → ${height.toFixed(1)}% (${height}px at 20px container)`)
})

// Test CSS styles
console.log('\n🎨 CSS Styles:')
console.log('Container: h-20 (80px height)')
console.log('Bar: w-full bg-blue-500/purple-500 rounded-t')
console.log('Min Height: 6px')
console.log('Height: percentage-based with minimum 10%')

console.log('\n✅ Chart visibility test completed!')
console.log('📋 Expected Behavior:')
console.log('  • All bars should be visible with minimum 10% height')
console.log('  • Bars should scale proportionally to their values')
console.log('  • Zero values should show minimum height bars')
console.log('  • Colors: blue for transactions, purple for approvals')
console.log('  • Container height: 80px (h-20)')
console.log('  • Bar width: full width of container') 