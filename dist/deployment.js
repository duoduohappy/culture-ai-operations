'use strict';
fetch('/api/deployment').then(r=>r.json()).then(info=>{if(!info.temporaryData)return;const notice=document.createElement('div');notice.className='notice';notice.id='deployment-notice';notice.setAttribute('role','note');notice.textContent=info.message;document.querySelector('main').prepend(notice);}).catch(()=>{});
