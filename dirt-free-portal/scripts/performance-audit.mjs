#!/usr/bin/env node

/**
 * Performance Audit Script
 *
 * Runs Lighthouse performance audits against the local development server
 * and validates scores against production readiness thresholds.
 *
 * Usage: npm run audit
 *
 * Prerequisites:
 * - Development server must be running on http://localhost:3009
 * - Run: npm run dev (in a separate terminal)
 *
 * Exit Codes:
 * - 0: All performance targets met (ready for deployment)
 * - 1: Performance targets not met (fix issues before deploying)
 */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Configuration
const TARGET_URL = 'http://localhost:3009'
const OUTPUT_PATH = resolve(__dirname, '../lighthouse-report.html')

// Performance thresholds (0-100 scale)
const THRESHOLDS = {
  performance: 85,
  accessibility: 90,
  'best-practices': 85,
  seo: 90,
}

// Lighthouse configuration
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
}

// Chrome launch options
const chromeFlags = [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
]

/**
 * Launch Chrome and run Lighthouse audit
 */
async function runLighthouseAudit() {
  let chrome
  try {
    console.log('🚀 Starting performance audit...\n')
    console.log(`Target URL: ${TARGET_URL}`)
    console.log('='.repeat(70))
    console.log('\n')

    // Launch Chrome
    console.log('🌐 Launching headless Chrome...')
    chrome = await chromeLauncher.launch({ chromeFlags })
    const port = chrome.port

    // Run Lighthouse
    console.log('🔍 Running Lighthouse audit (this may take 30-60 seconds)...\n')
    const options = {
      port,
      output: 'html',
      logLevel: 'error',
    }

    const runnerResult = await lighthouse(TARGET_URL, options, lighthouseConfig)

    // Extract results
    const { lhr, report } = runnerResult

    // Save HTML report
    writeFileSync(OUTPUT_PATH, report)
    console.log(`📄 Full report saved to: ${OUTPUT_PATH}\n`)

    // Display results
    console.log('📊 LIGHTHOUSE RESULTS:\n')
    console.log('='.repeat(70))
    console.log('\n')

    const categories = lhr.categories
    const results = []
    let allPassed = true

    // Check each category
    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round(category.score * 100)
      const threshold = THRESHOLDS[key]
      const passed = score >= threshold

      if (!passed) {
        allPassed = false
      }

      results.push({
        name: category.title,
        score,
        threshold,
        passed,
      })

      const icon = passed ? '✅' : '❌'
      const status = passed ? 'PASS' : 'FAIL'
      const label = category.title.padEnd(25)

      console.log(`${icon} ${label} Score: ${score}/100 (threshold: ${threshold}) [${status}]`)
    }

    // Display Core Web Vitals
    console.log('\n' + '='.repeat(70))
    console.log('\n📈 CORE WEB VITALS:\n')

    const audits = lhr.audits

    // LCP - Largest Contentful Paint
    const lcp = audits['largest-contentful-paint']
    const lcpValue = lcp.numericValue
    const lcpSeconds = (lcpValue / 1000).toFixed(2)
    const lcpPassed = lcpValue < 2500
    const lcpIcon = lcpPassed ? '✅' : '❌'
    console.log(`${lcpIcon} LCP (Largest Contentful Paint): ${lcpSeconds}s (target: < 2.5s)`)

    // TBT - Total Blocking Time (proxy for FID)
    const tbt = audits['total-blocking-time']
    const tbtValue = tbt.numericValue
    const tbtPassed = tbtValue < 200
    const tbtIcon = tbtPassed ? '✅' : '❌'
    console.log(`${tbtIcon} TBT (Total Blocking Time): ${Math.round(tbtValue)}ms (target: < 200ms)`)

    // CLS - Cumulative Layout Shift
    const cls = audits['cumulative-layout-shift']
    const clsValue = cls.numericValue
    const clsPassed = clsValue < 0.1
    const clsIcon = clsPassed ? '✅' : '❌'
    console.log(`${clsIcon} CLS (Cumulative Layout Shift): ${clsValue.toFixed(3)} (target: < 0.1)`)

    // Speed Index
    const speedIndex = audits['speed-index']
    const speedIndexValue = speedIndex.numericValue
    const speedIndexSeconds = (speedIndexValue / 1000).toFixed(2)
    const speedIndexPassed = speedIndexValue < 3400
    const speedIndexIcon = speedIndexPassed ? '✅' : '❌'
    console.log(`${speedIndexIcon} Speed Index: ${speedIndexSeconds}s (target: < 3.4s)`)

    // TTI - Time to Interactive
    const tti = audits['interactive']
    const ttiValue = tti.numericValue
    const ttiSeconds = (ttiValue / 1000).toFixed(2)
    const ttiPassed = ttiValue < 3800
    const ttiIcon = ttiPassed ? '✅' : '❌'
    console.log(`${ttiIcon} TTI (Time to Interactive): ${ttiSeconds}s (target: < 3.8s)`)

    // Display key opportunities
    console.log('\n' + '='.repeat(70))
    console.log('\n💡 KEY OPTIMIZATION OPPORTUNITIES:\n')

    const opportunities = Object.values(audits)
      .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score !== null && audit.score < 1)
      .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
      .slice(0, 5)

    if (opportunities.length > 0) {
      opportunities.forEach((opp, index) => {
        const savings = opp.numericValue ? `${(opp.numericValue / 1000).toFixed(2)}s` : 'N/A'
        console.log(`${index + 1}. ${opp.title}`)
        console.log(`   Potential savings: ${savings}`)
        console.log(`   ${opp.description}\n`)
      })
    } else {
      console.log('✅ No major optimization opportunities detected!\n')
    }

    // Summary
    console.log('='.repeat(70))
    console.log('\n📈 SUMMARY:\n')

    const passed = results.filter(r => r.passed).length
    const total = results.length

    console.log(`Tests Passed: ${passed}/${total}`)
    console.log(`Overall Status: ${allPassed ? '✅ READY FOR DEPLOYMENT' : '❌ NEEDS IMPROVEMENT'}`)

    if (!allPassed) {
      console.log('\n⚠️  Some performance targets were not met.')
      console.log('   Review the optimization opportunities above and the full report.')
      console.log(`   Report: ${OUTPUT_PATH}\n`)
    } else {
      console.log('\n✅ All performance targets met!')
      console.log('   Application is optimized and ready for production deployment.\n')
    }

    console.log('='.repeat(70))
    console.log('\n')

    // Return exit code
    return allPassed ? 0 : 1

  } catch (error) {
    console.error('\n❌ Error running performance audit:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure the development server is running on http://localhost:3009')
    console.error('   Run: npm run dev')
    console.error('2. Ensure Chrome is installed')
    console.error('3. Check that lighthouse and chrome-launcher packages are installed')
    console.error('   Run: npm install --save-dev lighthouse chrome-launcher\n')

    return 1
  } finally {
    // Clean up Chrome
    if (chrome) {
      await chrome.kill()
    }
  }
}

// Run the audit
runLighthouseAudit()
  .then(exitCode => {
    process.exit(exitCode)
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
