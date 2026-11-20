const assert=require('node:assert/strict'),http=require('node:http');const {once}=require('node:events');const {setup}=require('./backend-common.cjs');const port=Number(process.env.QA_HTTP_PORT||8947);const server=setup(__dirname,port,async({u,body})=>{if(u.pathname==='/api/echo')return body;if(u.pathname==='/api/health')return {ok:true};throw Object.assign(Error('Not found'),{status:404});});
async function request(url,options={},status=200){const r=await fetch(`http://127.0.0.1:${port}`+url,options);assert.equal(r.status,status,await r.clone().text());return r;}
(async()=>{if(!server.listening)await once(server,'listening');let count=0;const post=body=>({method:'POST',headers:{'Content-Type':'application/json'},body});
for(const body of ['{','null','[]','42','true']){await request('/api/echo',post(body),400);count++;}
await request('/api/echo',{method:'POST',headers:{'Content-Type':'text/plain'},body:'text'},415);count++;
await request('/api/echo',{...post('{}'),headers:{'Content-Type':'application/json',Origin:'https://untrusted.invalid'}},403);count++;
await new Promise((resolve,reject)=>{const q=http.request({hostname:'127.0.0.1',port,path:'/api/health',headers:{Host:'untrusted.invalid'}},r=>{r.resume();r.on('end',()=>{try{assert.equal(r.statusCode,403);resolve();}catch(e){reject(e)}});});q.on('error',reject);q.end();});count++;
await request('/api/echo',post(JSON.stringify({text:'x'.repeat(1024*1024)})),413);count++;
const echoed=await request('/api/echo',post('{"valid":true}'));assert.equal((await echoed.json()).valid,true);count++;
await request('/%zz',{},400);count++;
await request('/missing-file.js',{},404);count++;
const whole=await request('/style.css');const original=Buffer.from(await whole.arrayBuffer());const part=await request('/style.css',{headers:{Range:'bytes=0-9'}},206);assert.equal(part.headers.get('content-range'),`bytes 0-9/${original.length}`);assert.deepEqual(Buffer.from(await part.arrayBuffer()),original.subarray(0,10));count++;
await request('/style.css',{headers:{Range:'bytes=999999999-'}},416);count++;
await request('/style.css',{headers:{Range:'bytes=-0'}},416);count++;
const suffix=await request('/style.css',{headers:{Range:'bytes=-8'}},206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),original.subarray(-8));count++;
console.log(`${count} HTTP checks passed: malformed input, body limit, origin, host, recovery and byte ranges.`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{server.close();server.closeAllConnections();});
