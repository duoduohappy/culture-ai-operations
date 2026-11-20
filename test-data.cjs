const assert=require('node:assert/strict'),d=require('./demo-data.cjs').load();
const total=Object.values(d.meta.counts).reduce((a,n)=>a+n,0);assert.ok(total>=15000);
for(const [key,n] of Object.entries(d.meta.counts)){assert.equal(d[key].length,n);assert.equal(new Set(d[key].map(x=>x.id)).size,n,'Duplicate '+key);}
const ids=key=>new Set(d[key].map(x=>x.id));const projects=ids('projects'),members=ids('members'),employees=ids('employees'),suppliers=ids('suppliers');
for(const x of d.tickets){assert.ok(projects.has(x.projectId));assert.ok(members.has(x.memberId));assert.equal(x.amount,x.unitPrice*x.qty);}
for(const x of d.purchases){assert.ok(projects.has(x.projectId));assert.ok(suppliers.has(x.supplierId));assert.equal(x.amount,x.qty*x.unitPrice);}
for(const x of d.campaigns)assert.ok(projects.has(x.projectId));
for(const key of ['attendance','payroll','leaveRequests'])for(const x of d[key])assert.ok(employees.has(x.employeeId));
for(const x of d.payroll)assert.equal(x.net,x.gross-x.deduction);
for(const x of d.membershipCards)assert.ok(members.has(x.memberId));
for(const m of d.members)assert.equal(m.points,d.pointsTransactions.filter(x=>x.memberId===m.id).reduce((a,x)=>a+x.points,0));
const map={票务:'tickets',采购:'purchases',宣传:'campaigns',HR:'payroll'};
for(const l of d.ledger){assert.ok(Number.isFinite(l.amount)&&l.amount>=0);if(l.projectId)assert.ok(projects.has(l.projectId));assert.ok(d[map[l.sourceType]].some(x=>x.id===l.sourceId));}
for(const p of d.projects){const entries=d.ledger.filter(x=>x.projectId===p.id);assert.equal(p.net,entries.reduce((n,x)=>n+(x.direction==='收入'?x.amount:-x.amount),0));}
for(const r of d.refunds){const t=d.tickets.find(t=>t.id===r.ticketId);assert.equal(t.status,'已退款');assert.equal(t.amount,r.amount);assert.equal(d.ledger.filter(l=>l.sourceId===t.id&&l.category==='票务退款').length,1);}
for(const r of d.requests){assert.ok(employees.has(r.applicantId));assert.ok(Object.values(d).filter(Array.isArray).flat().some(x=>x.id===r.sourceId));}
assert.ok(d.requests.some(x=>x.status==='退回'));assert.ok(d.requests.some(x=>x.status==='待验收'));assert.ok(d.purchases.some(x=>x.status==='逾期待交付'));
console.log(`PASS ${total} synthetic records: unique IDs, references, ticket/refund amounts, project ledger totals, payroll and points balances.`);
