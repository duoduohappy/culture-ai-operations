'use strict';
const {spawnSync}=require('node:child_process');
for(const file of ["test.cjs","test-data.cjs","test-business.cjs","test-regressions.cjs","test-http.cjs","test-free-render.cjs"]){console.log('\nRunning '+file);const r=spawnSync(process.execPath,[file],{cwd:__dirname,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
console.log('All automated checks passed. Real model/OBS tests run separately with npm run test:e2e.');
