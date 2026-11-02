import test from 'node:test';
import assert from 'node:assert/strict';
import { decideRun, inWindow, turkeyDate } from './daily-window.mjs';

test('15 günlük pencerenin iki sınırı dahil; önce, sonra ve sonraki yıl hariç', () => {
  assert.equal(inWindow('2026-11-04'), false);
  for (let day = 5; day <= 19; day++) assert.equal(inWindow(`2026-11-${String(day).padStart(2, '0')}`), true);
  assert.equal(inWindow('2026-11-20'), false);
  assert.equal(inWindow('2027-11-05'), false);
});

test('Türkiye tarihi UTC gün sınırından üç saat önce değişir', () => {
  assert.equal(turkeyDate(new Date('2026-11-04T20:59:59Z')), '2026-11-04');
  assert.equal(turkeyDate(new Date('2026-11-04T21:00:00Z')), '2026-11-05');
});

test('pencere dışında yalnız main üzerindeki manuel dry-run çalışabilir', () => {
  const options = { date: '2026-11-02', event: 'workflow_dispatch', dryRun: 'true', ref: 'refs/heads/main' };
  assert.deepEqual(decideRun(options), { date: '2026-11-02', dryRun: true, shouldRun: true });
  assert.equal(decideRun({ ...options, dryRun: 'false' }).shouldRun, false);
  assert.equal(decideRun({ ...options, event: 'schedule' }).shouldRun, false);
  assert.equal(decideRun({ ...options, ref: 'refs/heads/other' }).shouldRun, false);
});
