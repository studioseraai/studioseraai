import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const [command,...args]=process.argv.slice(2);
if(!['dev','build','start'].includes(command))throw Error('Expected dev, build or start.');
const next=fileURLToPath(new URL('../node_modules/next/dist/bin/next',import.meta.url));
const result=spawnSync(process.execPath,[next,command,...(command==='start'?[]:['--webpack']),...args],{stdio:'inherit',env:{...process.env,VERCEL:'1'}});
if(result.error)throw result.error;
process.exit(result.status??1);
