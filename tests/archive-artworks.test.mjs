import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveCandidates,validateArchiveSelection} from '../lib/archive-artworks.ts';
const records=[{id:1,kind:'artwork',title:'Blue Window',artist:'Artist A',legacyInventoryId:'508'},{id:2,kind:'artwork',title:'Calligraphy',artist:'Artist B',archived:true,webId:'ID3792'},{id:3,kind:'artist',title:'Artist A'}];
test('archive manager separates active and archived paintings without mutating inventory',()=>{assert.deepEqual(archiveCandidates(records,false,'').map(a=>a.id),[1]);assert.deepEqual(archiveCandidates(records,true,'').map(a=>a.id),[2]);assert.equal(records[0].archived,undefined);});
test('archive search matches title, artist, SERAAI ID and legacy references',()=>{for(const query of ['blue','Artist A','SS-0001','508'])assert.equal(archiveCandidates(records,false,query)[0].id,1);assert.equal(archiveCandidates(records,true,'ID3792')[0].id,2);assert.equal(archiveCandidates(records,true,'no match').length,0);});
test('archive payload requires an explicit boolean and unique positive safe IDs',()=>{assert.deepEqual(validateArchiveSelection([9,1,4],true),[1,4,9]);for(const ids of [[],[1,1],[0],[-1],['1'],[NaN],[1.2],[Number.MAX_SAFE_INTEGER+1],Array(1001).fill(1)])assert.throws(()=>validateArchiveSelection(ids,true));assert.throws(()=>validateArchiveSelection([1],'false'));});
