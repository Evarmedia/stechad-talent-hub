// Controlled HTTP fixtures + the built application in a disposable Chrome profile.
// Run after npm run build. No application database or real identity is used.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(path.join(tmpdir(), 'stechad-phase2-browser-'));
const requests=[]; const errors=[];
let enrolled=false, assured=false, role='operator', suspended=false, granted=false, revoked=false, expireNext=false, refreshes=0, oauthChallenge=null, oauthReturn=null;
const permissions = () => role==='super' ? ['platform.organizations.read','platform.organizations.manage','platform.users.read','platform.users.manage','platform.grants.read','platform.grants.manage','platform.audit.read'] : ['platform.organizations.read','platform.users.read','platform.audit.read',...(role==='operator'?['platform.organizations.manage','platform.users.manage']:[])];
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const respond=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({success:status<400,...(status<400?{data}:data)}));};
  if(url.pathname.startsWith('/api/')){
    requests.push({method:req.method,path:url.pathname,organization:req.headers['x-organization-id']});
    let body='';for await(const chunk of req)body+=chunk;
    const payload=body?JSON.parse(body):{};
    if(url.pathname==='/api/auth/google'){oauthChallenge=url.searchParams.get('code_challenge');oauthReturn=url.searchParams.get('return_to');assert.ok(['/platform-admin.html','/google-auth'].includes(oauthReturn));return respond({started:true});}
    if(url.pathname==='/api/auth/oauth/exchange'){assert.equal(payload.code,'fixture-code');assert.equal(createHash('sha256').update(payload.code_verifier).digest('base64url'),oauthChallenge);return respond({user:{user_id:'fixture',email:'operator@example.test'},token:'oauth-access',refreshToken:'oauth-refresh'});}
    if(url.pathname==='/api/auth/me')return respond({user:{user_id:'fixture',email:'operator@example.test',first_name:'Fixture',last_name:'Talent',role:'talent',talent:{is_onboarded:false}},organizations:[{organization_id:'org-a',name:'Alpha workspace'}],active_organization_id:'org-a'});
    if(url.pathname==='/api/auth/login')return payload.password==='valid-password'?respond({user:{user_id:'fixture',email:'operator@example.test'},token:'access',refreshToken:'refresh'}):respond({message:'Invalid credentials'},401);
    if(url.pathname==='/api/auth/refresh-token') { refreshes++; await delay(100); assert.equal(payload.refresh_token,'refresh-old');return respond({token:'winner-access',refreshToken:'winner-refresh'}); }
    if(url.pathname==='/api/auth/logout')return respond({revoked:true});
    if(req.headers.authorization==='Bearer expired')return respond({message:'Access expired'},401);
    if(url.pathname==='/api/platform/me')return respond({user:{user_id:'fixture',email:'operator@example.test'},roles:[{role_id:role,role_key:`platform_${role}`,name:role}],permissions:permissions(),mfa:{enrolled,verified:assured,assurance_expires_at:assured?new Date(Date.now()+900000).toISOString():null},requires_mfa_enrollment:!enrolled});
    if(url.pathname==='/api/platform/mfa/enroll')return respond({secret:'FIXTURE-MANUAL-KEY',otpauth_url:'otpauth://totp/test?secret=FIXTURE-MANUAL-KEY',expires_at:new Date(Date.now()+600000).toISOString()});
    if(url.pathname==='/api/platform/mfa/confirm'){enrolled=true;assured=true;return respond({recovery_codes:['fixture-code-one','fixture-code-two'],assurance_expires_at:new Date(Date.now()+900000).toISOString()});}
    if(url.pathname==='/api/platform/mfa/verify'){assert.ok(payload.recovery_code||payload.code);assured=true;return respond({assurance_expires_at:new Date(Date.now()+900000).toISOString()});}
    if(url.pathname.startsWith('/api/platform/')){
      if(expireNext){expireNext=false;assured=false;}
      if(!assured)return respond({code:'MFA_EXPIRED',message:'Verify platform access again.'},403);
      if(req.method==='PATCH'){assert.ok(payload.reason);if(url.pathname.includes('/organizations/'))suspended=payload.status==='suspended';return respond({organization:{},user:{}});}
      if(req.method==='POST'&&url.pathname==='/api/platform/grants'){assert.ok(payload.reason);granted=true;return respond({grant:{grant_id:'g1'}});}
      if(req.method==='DELETE'&&url.pathname==='/api/platform/grants/g1'){assert.ok(payload.reason);revoked=true;return respond({grant:{grant_id:'g1'}});}
      const pagination={page:1,limit:20,total:1,total_pages:1};
      if(url.pathname==='/api/platform/organizations')return respond({organizations:url.searchParams.get('search')?[ ]:[{organization_id:'org-a',slug:'alpha',name:'Alpha workspace',status:suspended?'suspended':'active',active_member_count:3,owner_count:1,created_at:'2026-11-22T09:00:00Z'}],pagination});
      if(url.pathname==='/api/platform/users')return respond({users:[{user_id:'target',email:'target@example.test',first_name:'A',last_name:'User',is_active:true,is_verified:true,created_at:'2026-11-22T09:00:00Z'}],pagination});
      if(url.pathname==='/api/platform/roles')return respond({roles:[{role_id:'viewer',role_key:'platform_viewer',name:'Platform viewer',permission_keys:['platform.users.read']}],permissions:['platform.users.read']});
      if(url.pathname==='/api/platform/grants')return respond({grants:granted?[{grant_id:'g1',user_id:'target',email:'target@example.test',role_key:'platform_viewer',status:revoked?'revoked':'active',created_at:'2026-11-22T09:00:00Z'}]:[],pagination:{...pagination,total:granted?1:0}});
      if(url.pathname==='/api/platform/audit-log')return respond({entries:[{audit_log_id:'audit',actor_name:'Fixture operator',action:'platform.organization.status_changed',target_type:'organization',target_id:'org-a',outcome:'success',occurred_at:'2026-11-22T09:00:00Z',changes:{reason:'Controlled review'}}],pagination});
    }
    return respond({message:'Unexpected fixture request'},404);
  }
  if(url.pathname==='/browser-fixture.html'){res.writeHead(200,{'Content-Type':'text/html'});return res.end('<!doctype html><title>Browser fixture</title>');}
  try{
    const file=path.join(process.cwd(),'dist',url.pathname==='/'||(!path.extname(url.pathname)&&!url.pathname.startsWith('/assets/'))?'index.html':url.pathname);
    const buffer=await readFile(file);const ext=path.extname(file);
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[ext]||'application/octet-stream'});res.end(buffer);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const chrome=spawn(process.env.CHROME_BIN||'/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let debuggerOrigin;
const clients=[];
class Page{
  constructor(ws){this.ws=ws;this.pending=new Map();this.next=0;ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id){const pending=this.pending.get(msg.id);this.pending.delete(msg.id);if(msg.error)pending?.reject(new Error(msg.error.message));else pending?.resolve(msg.result);}else if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text);});}
  async send(method,params={}){const id=++this.next;const promise=new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}));this.ws.send(JSON.stringify({id,method,params}));return promise;}
  async evaluate(expression){const result=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;}
  async wait(expression){for(let i=0;i<100;i++){if(await this.evaluate(expression))return;await delay(50);}throw new Error(`Browser condition timed out: ${expression}`);}
  async text(text){await this.wait(`document.body.innerText.includes(${JSON.stringify(text)})`);}
  async click(text){const selector=`[...(document.querySelector('[role="alertdialog"]')||document).querySelectorAll('button,a')].find(el=>!el.disabled&&el.textContent.trim()===${JSON.stringify(text)})`;await this.wait(`!!(${selector})`);await this.evaluate(`(${selector}).click()`);}
  async fill(id,value){await this.wait(`!!document.getElementById(${JSON.stringify(id)})`);await this.evaluate(`(()=>{const input=document.getElementById(${JSON.stringify(id)});Object.getOwnPropertyDescriptor(input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
  async navigate(url){await this.send('Page.navigate',{url});await this.wait(`document.readyState==='complete'`);}
  async screenshot(name){const shot=await this.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(path.join(tmpdir(),name),Buffer.from(shot.data,'base64'));}
  async close(){await this.send('Page.close');this.ws.close();}
}
async function open(url){const target=await(await fetch(`${debuggerOrigin}/json/new?${encodeURIComponent('about:blank')}`,{method:'PUT'})).json();const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});const page=new Page(ws);clients.push(page);await page.send('Runtime.enable');await page.send('Page.enable');await page.send('Network.enable');await page.send('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});if(url!=='about:blank')await page.navigate(url);return page;}
try{
  for(let i=0;i<100;i++){try{const port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];debuggerOrigin=`http://127.0.0.1:${port}`;break;}catch{await delay(50);}}
  assert.ok(debuggerOrigin,'Chrome remote debugger started');
  const page=await open(`${origin}/platform-admin.html`);await page.text('Platform sign-in');
  await page.fill('platform-email','operator@example.test');await page.fill('platform-password','wrong-password');await page.click('Sign in');await page.text('Invalid credentials');
  await page.fill('platform-password','valid-password');await page.click('Sign in');await page.text('Set up platform MFA');
  await page.click('Set up authenticator');await page.wait(`!!document.getElementById('mfa-secret')`);assert.equal(await page.evaluate(`document.getElementById('mfa-secret').type`),'password');
  await page.fill('mfa-code','123456');await page.click('Confirm authenticator');await page.text('Save recovery codes');await page.click('Show recovery codes');await page.click('I have saved my recovery codes');await page.text('Alpha workspace');
  assert.equal(await page.evaluate(`[...document.querySelectorAll('nav a')].some(a=>a.textContent==='Role grants')`),false);
  assert.equal(requests.some(req=>req.path==='/api/platform/roles'),false);
  await page.click('Suspend Alpha workspace');await page.click('Suspend organization');await page.text('Enter a reason');await page.fill('action-reason','Controlled review');await page.click('Suspend organization');await page.text('Reactivate Alpha workspace');
  await page.screenshot('stechad-phase2-admin-desktop.png');
  await page.fill('platform-search','no match');await page.click('Search');await page.text('No matching results');await page.click('Clear search');await page.text('Alpha workspace');
  expireNext=true;await page.click('Users');await page.text('Verify platform access');assert.equal(await page.evaluate(`localStorage.getItem('stechad_token')`),'access');
  await page.click('Use a recovery code instead');await page.fill('mfa-code','fixture-code-one');await page.click('Use recovery code');await page.text('Platform security');
  await page.click('Replace authenticator');await page.fill('action-reason','New phone');await page.click('Start replacement');await page.click('Set up authenticator');await page.fill('mfa-code','123456');await page.click('Confirm authenticator');await page.click('I have saved my recovery codes');await page.text('Platform security');
  role='super';await page.navigate(`${origin}/platform-admin.html?view=grants`);await page.text('Role grants');await page.click('Grant platform role');await page.wait(`document.querySelector('#grant-role option[value="viewer"]')!==null`);await page.click('Grant platform role');assert.equal(await page.evaluate('document.activeElement.id'),'grant-user');await page.fill('grant-user','target');await page.click('Grant platform role');assert.equal(await page.evaluate('document.activeElement.id'),'grant-role');await page.fill('grant-role','viewer');await page.click('Grant platform role');assert.equal(await page.evaluate('document.activeElement.id'),'action-reason');await page.fill('action-reason','Read-only audit');await page.click('Grant platform role');await page.text('target@example.test');await page.click('Revoke role');await page.fill('action-reason','Audit complete');await page.click('Revoke platform role');await page.text('revoked');
  await page.click('Role catalog');await page.text('platform.users.read');await page.click('Audit log');await page.text('Controlled review');
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await page.screenshot('stechad-phase2-admin-mobile.png');
  assert.equal(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'narrow document does not overflow');
  await page.evaluate(`document.querySelector('nav a').focus()`);assert.equal(await page.evaluate(`document.activeElement.tagName`),'A');
  role='viewer';await page.navigate(`${origin}/platform-admin.html`);await page.text('Alpha workspace');assert.equal(await page.evaluate(`[...document.querySelectorAll('button')].some(el=>/Suspend|Reactivate/.test(el.textContent))`),false);
  role='operator';await page.navigate(`${origin}/browser-fixture.html`);await page.evaluate(`localStorage.setItem('stechad_token','expired');localStorage.setItem('stechad_refresh_token','refresh-old');localStorage.setItem('stechad_identity_revision','browser-refresh-test');sessionStorage.setItem('stechad_organization_id','org-a');`);
  const second=await open('about:blank');
  await Promise.all([page.navigate(`${origin}/platform-admin.html`),second.navigate(`${origin}/platform-admin.html`)]);await Promise.all([page.text('Alpha workspace'),second.text('Alpha workspace')]);assert.equal(refreshes,1,'two tabs share one refresh rotation');
  assert.equal(await second.evaluate(`localStorage.getItem('stechad_refresh_token')`),'winner-refresh');
  await page.click('Sign out');await second.text('Platform sign-in');assert.equal(await second.evaluate(`localStorage.getItem('stechad_token')`),null);
  assert.ok(requests.filter(req=>req.path.startsWith('/api/platform/')).every(req=>!req.organization),'platform requests omit tenant headers');
  assert.ok(requests.every(req=>req.path.startsWith('/api/platform/')||req.path.startsWith('/api/auth/')),'internal entry never requests HR endpoints');
  await page.text('Platform sign-in');await page.click('Continue with Google');await page.wait(`location.pathname==='/api/auth/google'`);
  const verifier=await page.evaluate(`sessionStorage.getItem('stechad_google_pkce_verifier')`);assert.equal(verifier.length,43);assert.equal(createHash('sha256').update(verifier).digest('base64url'),oauthChallenge);
  await page.navigate(`${origin}/platform-admin.html?code=fixture-code`);await page.text('Alpha workspace');assert.equal(await page.evaluate(`sessionStorage.getItem('stechad_google_pkce_verifier')`),null);assert.equal(await page.evaluate(`location.search.includes('code=')`),false);
  // Customer Google uses the real app route tree after its full-page callback.
  await page.evaluate(`localStorage.clear();sessionStorage.removeItem('stechad_organization_id');`);
  await page.navigate(`${origin}/login`);await page.click('Google');await page.wait(`location.pathname==='/api/auth/google'`);
  assert.equal(oauthReturn,'/google-auth');
  await page.navigate(`${origin}/google-auth?code=fixture-code`);await page.wait(`location.pathname==='/onboarding'`);
  assert.equal(await page.evaluate(`localStorage.getItem('stechad_token')`),'oauth-access');
  assert.equal(await page.evaluate(`sessionStorage.getItem('stechad_google_pkce_verifier')`),null);
  assert.equal(errors.length,0,`browser exceptions: ${errors.join(', ')}`);
  console.log(JSON.stringify({passed:true,checks:['password failure/success','MFA enrollment/confirmation/recovery/replacement/expiry','operator/viewer/grant permissions','reason-required status/grant actions','catalog and sanitized audits','search empty/clear','narrow layout/reduced motion/keyboard focus','cross-tab refresh/logout','platform and customer Google PKCE/code exchange with onboarding route','grant first-invalid focus order','no tenant headers/HR endpoints in internal entry'],refreshRequests:refreshes,screenshots:['/tmp/stechad-phase2-admin-desktop.png','/tmp/stechad-phase2-admin-mobile.png']},null,2));
}catch(error){console.error('Browser check failed', error.message, 'runtime exceptions', errors);for(const page of clients){try{console.error('Rendered state:',await page.evaluate('document.body.innerText'));}catch{}}throw error;}finally{for(const page of clients)page.ws.close();chrome.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await delay(150);await rm(profile,{recursive:true,force:true});}
