(function(root){
'use strict';
const modules=['会员','票务','宣传','财务','采购','演出立项','HR'];
function seed(){return {schema:1,seq:8,members:[{id:'M001',name:'演示会员林女士',active:true}],tickets:[{id:'T001',project:'星河音乐会',qty:2,status:'有效',amount:560}],ledger:[],requests:modules.map((module,i)=>({id:'REQ'+String(i+1).padStart(3,'0'),module,title:['新会员入会办理','星河音乐会票务订单','音乐会宣传发布','演出费用报销','舞台耗材采购','星河音乐会立项','舞台技术人员入职'][i],amount:[199,560,1200,800,2500,20000,0][i],qty:module==='票务'?2:1,subject:['演示会员周先生','演示购票人','公众号宣传','差旅报销','灯具线材','星河音乐会','演示员工陈先生'][i],status:'草稿',advice:null,result:null,created:new Date().toISOString()})),logs:[]};}
function log(s,id,message){s.logs.unshift({at:new Date().toISOString(),id,message});}
function create(s,data){if(!modules.includes(data.module)||!data.title?.trim()||!data.subject?.trim())throw Error('请完整填写业务类型、标题和对象');const amount=Number(data.amount),qty=Number(data.qty||1);if(!Number.isFinite(amount)||amount<0||!Number.isSafeInteger(qty)||qty<1||qty>10000)throw Error('金额或数量无效');const r={id:'REQ'+String(s.seq++).padStart(3,'0'),module:data.module,title:data.title.trim(),subject:data.subject.trim(),amount,qty,status:'草稿',advice:null,result:null,created:new Date().toISOString()};s.requests.unshift(r);log(s,r.id,'创建业务草稿');return r;}
function act(s,id,action){const r=s.requests.find(x=>x.id===id);if(!r)throw Error('业务记录不存在');
if(action==='analyze'){if(!['草稿','退回'].includes(r.status))throw Error('当前阶段不能修改建议');r.advice=`规则模拟建议（未调用大模型）：${r.module}事项“${r.title}”，金额 ¥${r.amount.toFixed(2)}。${r.amount>10000?'金额较大，建议复核预算与授权。':'请核对业务对象、凭证及授权。'} 该建议不构成审批结论。`;}
else if(action==='submit'){if(!['草稿','退回'].includes(r.status))throw Error('仅草稿或退回记录可提交');r.status='待审批';}
else if(action==='approve'){if(r.status!=='待审批')throw Error('仅待审批记录可批准');r.status='待执行';}
else if(action==='reject'){if(r.status!=='待审批')throw Error('仅待审批记录可退回');r.status='退回';r.advice=null;}
else if(action==='execute'){if(r.status!=='待执行')throw Error('必须先审批通过');
 const receipt={id:'RES-'+r.id,at:new Date().toISOString(),module:r.module,amount:r.amount};
 if(r.module==='会员'){const m={id:'M-'+r.id,name:r.subject,active:true};s.members.push(m);receipt.message='会员已激活，会员号 '+m.id;}
 if(r.module==='票务'){const t={id:'T-'+r.id,project:r.title,qty:r.qty,status:'有效',amount:r.amount};s.tickets.push(t);receipt.message=`已出票 ${r.qty} 张，订单号 ${t.id}`;}
 if(r.module==='宣传')receipt.message='已记录模拟发布回执；未向外部平台发布';
 if(r.module==='财务'){s.ledger.push({id:'L-'+r.id,request:r.id,direction:'支出',amount:r.amount});receipt.message='已登记演示支出流水；未发生真实付款';}
 if(r.module==='采购')receipt.message='已创建演示采购订单，等待收货验收';
 if(r.module==='演出立项')receipt.message='已建立演出项目，预算 ¥'+r.amount.toFixed(2);
 if(r.module==='HR')receipt.message='已建立演示员工入职记录';
 r.result=receipt;r.status=r.module==='采购'?'待验收':'已完成';
}
else if(action==='receive'){if(r.module!=='采购'||r.status!=='待验收')throw Error('当前记录不可收货');r.status='已完成';r.result.message='采购订单已收货并验收，形成待付款事项';}
else if(action==='refund'){if(r.module!=='票务'||r.status!=='已完成')throw Error('仅已完成票务订单可退票');const t=s.tickets.find(x=>x.id==='T-'+r.id);if(!t||t.status!=='有效')throw Error('订单不可重复退票');t.status='已退款';r.status='已退款';r.result.message='已记录模拟退票退款；未发生真实资金操作';}
else throw Error('未知操作');log(s,id,{analyze:'生成规则模拟建议',submit:'提交审批',approve:'演示审批通过',reject:'退回补充',execute:'执行并生成结果',receive:'收货验收完成',refund:'退票退款完成'}[action]);return r;}
const api={modules,seed,create,act};if(typeof module!=='undefined')module.exports=api;root.Ops=api;
})(typeof globalThis!=='undefined'?globalThis:this);
