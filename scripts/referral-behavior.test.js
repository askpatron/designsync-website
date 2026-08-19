#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const websiteRoot = path.join(__dirname, '..');
const referralSource = fs.readFileSync(path.join(websiteRoot, 'js', 'referral.js'), 'utf8');
const mainSource = fs.readFileSync(path.join(websiteRoot, 'js', 'main.js'), 'utf8');

const context = {
    Date,
    JSON,
    URL,
    URLSearchParams,
    Array,
    Number,
    String,
    console,
};
context.globalThis = context;
vm.runInNewContext(referralSource, context);
const referral = context.DesignSyncReferral;

const memoryStorage = (initial) => {
    const data = Object.assign({}, initial || {});
    return {
        getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
        setItem: (key, value) => { data[key] = String(value); },
        removeItem: (key) => { delete data[key]; },
        snapshot: () => data,
    };
};

const storedValue = (storage) => {
    const raw = storage.getItem('ds_referral');
    return raw ? JSON.parse(raw) : null;
};

const makeDoc = (hrefs) => {
    const anchors = hrefs.map((href) => ({ href }));
    return {
        querySelectorAll: () => anchors,
        anchors,
    };
};

const now = Date.parse('2026-08-19T00:00:00.000Z');
const portal = 'http://127.0.0.1:8100';

let failed = 0;
const check = (label, fn) => {
    try {
        fn();
        console.log('ok  ' + label);
    } catch (error) {
        failed += 1;
        console.error('FAIL  ' + label);
        console.error('  ' + error.message);
    }
};

check('invalid stored A is replaced by an explicit valid query B', () => {
    const storage = memoryStorage({
        ds_referral: JSON.stringify({ code: 'NOSUCH', capturedAt: '2026-08-18T00:00:00.000Z' }),
    });
    const code = referral.retain(storage, 'BETA1', now);
    assert.strictEqual(code, 'BETA1');
    assert.strictEqual(storedValue(storage).code, 'BETA1');

    const doc = makeDoc([
        portal + '/start',
        portal + '/start?plan=starter',
        portal + '/login',
        'https://app.trydesignsync.com/privacy',
    ]);
    referral.applyToStartLinks(doc, portal, code);
    assert.strictEqual(doc.anchors[0].href, portal + '/start?ref=BETA1');
    assert.strictEqual(doc.anchors[1].href, portal + '/start?plan=starter&ref=BETA1');
    assert.strictEqual(doc.anchors[2].href, portal + '/login');
    assert.strictEqual(doc.anchors[3].href, 'https://app.trydesignsync.com/privacy');
});

check('disabled-looking stored A is replaced by later valid query B', () => {
    const storage = memoryStorage({
        ds_referral: JSON.stringify({ code: 'OLD20', capturedAt: '2026-08-01T00:00:00.000Z' }),
    });
    assert.strictEqual(referral.retain(storage, 'UAT20', now), 'UAT20');
    assert.strictEqual(storedValue(storage).code, 'UAT20');
});

check('invalid query format does not erase a stored code', () => {
    const storage = memoryStorage({
        ds_referral: JSON.stringify({ code: 'ADA20', capturedAt: '2026-08-18T00:00:00.000Z' }),
    });
    assert.strictEqual(referral.retain(storage, 'not a code!', now), 'ADA20');
    assert.strictEqual(storedValue(storage).code, 'ADA20');
});

check('reload without a query keeps the stored code', () => {
    const storage = memoryStorage({
        ds_referral: JSON.stringify({ code: 'ADA20', capturedAt: '2026-08-18T00:00:00.000Z' }),
    });
    assert.strictEqual(referral.retain(storage, null, now), 'ADA20');
});

check('empty storage stores the first well-formed query', () => {
    const storage = memoryStorage();
    assert.strictEqual(referral.retain(storage, 'ada20', now), 'ada20');
    assert.strictEqual(storedValue(storage).code, 'ada20');
});

check('main.js asks retain to run even when storage is already populated', () => {
    assert.match(mainSource, /retain\(localStorage, queryCode\)/);
    assert.doesNotMatch(mainSource, /queryCode && !stored/);
});

if (failed) {
    console.error('\n' + failed + ' referral behavior check(s) failed.');
    process.exit(1);
}

console.log('\nReferral JS behavior checks passed.');
