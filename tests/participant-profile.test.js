import test from 'node:test';
import assert from 'node:assert/strict';
const a='Châu Kim Nhẩn - NhanCk',b='Nguyễn Thị Kim Thảo - ThaoNTK';
test('roster identity survives a check-in nickname but selecting another person changes the identity',async()=>{
 const {resolveParticipantKey,participantOrderName}=await import('../dist/participant-profile.js');
 const key=resolveParticipantKey(a);assert.equal(key,'member:NhanCk');
 assert.equal(resolveParticipantKey(a.normalize('NFD')),key);
 assert.equal(resolveParticipantKey('Nhân cute',key),key);assert.equal(participantOrderName(key,'Nhân cute'),a);
 assert.equal(resolveParticipantKey(b,key),'member:ThaoNTK');
});
test('custom guests retain their identity on rename and invalid or empty profiles never select a roster default',async()=>{
 const {resolveParticipantKey,participantOrderName}=await import('../dist/participant-profile.js');
 const uuid='e88eeec0-bbbd-49ad-a570-958d82fdc8fb';let calls=0;
 const id=()=>{calls++;return uuid;};assert.equal(resolveParticipantKey('',undefined,id),'');assert.equal(calls,0);
 const key=resolveParticipantKey('Mây','invalid',id);assert.equal(key,'guest:'+uuid);assert.equal(calls,1);
 assert.equal(resolveParticipantKey('Mây vui vẻ',key,id),key);assert.equal(calls,1);assert.equal(participantOrderName(key,'  Mây   vui vẻ  '),'Mây vui vẻ');
});
