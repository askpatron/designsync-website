#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const referral = fs.readFileSync(path.join(__dirname, '..', 'js', 'referral.js'), 'utf8');
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const failures = [];

const expect = (label, condition) => {
    if (!condition) failures.push(label);
};

expect('referral helper exported', referral.includes('global.DesignSyncReferral'));
expect('explicit query overwrites stored code', referral.includes('if (queryCode)') && referral.includes('writeStored(storage, queryCode, now)'));
expect('invalid query leaves stored code', referral.includes('Invalid') || referral.includes('leave the stored'));
expect('local portal pairing', source.includes("? 'http://127.0.0.1:8100'"));
expect('staging portal pairing', source.includes("'https://staging.trydesignsync.com'"));
expect('production portal pairing', source.includes("'https://app.trydesignsync.com'"));
expect('capture endpoint', source.includes("'/referral/capture'"));
expect('credentialed capture', source.includes("credentials: 'include'"));
expect('start path guard', referral.includes("url.pathname !== '/start'"));
expect('does not duplicate ref', referral.includes("searchParams.set('ref'"));
expect('storage is code plus time', referral.includes('capturedAt') && referral.includes("storageKey = 'ds_referral'"));
expect('format matches Laravel', referral.includes('/^[A-Za-z0-9_-]{1,40}$/'));
expect('no partner PII fields stored', !/localStorage\.setItem\([^)]*email/i.test(referral + source));

if (failures.length) {
    console.error('Referral JS checks failed:\n- ' + failures.join('\n- '));
    process.exit(1);
}

console.log('Referral JS static checks passed.');
