var ts=Object.defineProperty;var at=e=>{throw TypeError(e)};var ss=(e,t,s)=>t in e?ts(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var w=(e,t,s)=>ss(e,typeof t!="symbol"?t+"":t,s),Ve=(e,t,s)=>t.has(e)||at("Cannot "+s);var f=(e,t,s)=>(Ve(e,t,"read from private field"),s?s.call(e):t.get(e)),_=(e,t,s)=>t.has(e)?at("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),y=(e,t,s,a)=>(Ve(e,t,"write to private field"),a?a.call(e,s):t.set(e,s),s),T=(e,t,s)=>(Ve(e,t,"access private method"),s);var rt=(e,t,s,a)=>({set _(r){y(e,t,r,s)},get _(){return f(e,t,a)}});import as from"crypto";var it=(e,t,s)=>(a,r)=>{let i=-1;return n(0);async function n(l){if(l<=i)throw new Error("next() called multiple times");i=l;let o,c=!1,d;if(e[l]?(d=e[l][0][0],a.req.routeIndex=l):d=l===e.length&&r||void 0,d)try{o=await d(a,()=>n(l+1))}catch(u){if(u instanceof Error&&t)a.error=u,o=await t(u,a),c=!0;else throw u}else a.finalized===!1&&s&&(o=await s(a));return o&&(a.finalized===!1||c)&&(a.res=o),a}},rs=Symbol(),is=async(e,t=Object.create(null))=>{const{all:s=!1,dot:a=!1}=t,i=(e instanceof Rt?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?ns(e,{all:s,dot:a}):{}};async function ns(e,t){const s=await e.formData();return s?os(s,t):{}}function os(e,t){const s=Object.create(null);return e.forEach((a,r)=>{t.all||r.endsWith("[]")?ls(s,r,a):s[r]=a}),t.dot&&Object.entries(s).forEach(([a,r])=>{a.includes(".")&&(cs(s,a,r),delete s[a])}),s}var ls=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},cs=(e,t,s)=>{let a=e;const r=t.split(".");r.forEach((i,n)=>{n===r.length-1?a[i]=s:((!a[i]||typeof a[i]!="object"||Array.isArray(a[i])||a[i]instanceof File)&&(a[i]=Object.create(null)),a=a[i])})},Et=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},ds=e=>{const{groups:t,path:s}=us(e),a=Et(s);return ps(a,t)},us=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,a)=>{const r=`@${a}`;return t.push([r,s]),r}),{groups:t,path:e}},ps=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[a]=t[s];for(let r=e.length-1;r>=0;r--)if(e[r].includes(a)){e[r]=e[r].replace(a,t[s][1]);break}}return e},Ne={},fs=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const a=`${e}#${t}`;return Ne[a]||(s[2]?Ne[a]=t&&t[0]!==":"&&t[0]!=="*"?[a,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:Ne[a]=[e,s[1],!0]),Ne[a]}return null},st=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},xs=e=>st(e,decodeURI),Tt=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let a=s;for(;a<t.length;a++){const r=t.charCodeAt(a);if(r===37){const i=t.indexOf("?",a),n=t.slice(s,i===-1?void 0:i);return xs(n.includes("%25")?n.replace(/%25/g,"%2525"):n)}else if(r===63)break}return t.slice(s,a)},ms=e=>{const t=Tt(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},ce=(e,t,...s)=>(s.length&&(t=ce(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),Ct=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let a="";return t.forEach(r=>{if(r!==""&&!/\:/.test(r))a+="/"+r;else if(/\:/.test(r))if(/\?/.test(r)){s.length===0&&a===""?s.push("/"):s.push(a);const i=r.replace("?","");a+="/"+i,s.push(a)}else a+="/"+r}),s.filter((r,i,n)=>n.indexOf(r)===i)},Ke=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?st(e,St):e):e,At=(e,t,s)=>{let a;if(!s&&t&&!/[%+]/.test(t)){let n=e.indexOf("?",8);if(n===-1)return;for(e.startsWith(t,n+1)||(n=e.indexOf(`&${t}`,n+1));n!==-1;){const l=e.charCodeAt(n+t.length+1);if(l===61){const o=n+t.length+2,c=e.indexOf("&",o);return Ke(e.slice(o,c===-1?void 0:c))}else if(l==38||isNaN(l))return"";n=e.indexOf(`&${t}`,n+1)}if(a=/[%+]/.test(e),!a)return}const r={};a??(a=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const n=e.indexOf("&",i+1);let l=e.indexOf("=",i);l>n&&n!==-1&&(l=-1);let o=e.slice(i+1,l===-1?n===-1?void 0:n:l);if(a&&(o=Ke(o)),i=n,o==="")continue;let c;l===-1?c="":(c=e.slice(l+1,n===-1?void 0:n),a&&(c=Ke(c))),s?(r[o]&&Array.isArray(r[o])||(r[o]=[]),r[o].push(c)):r[o]??(r[o]=c)}return t?r[t]:r},hs=At,gs=(e,t)=>At(e,t,!0),St=decodeURIComponent,nt=e=>st(e,St),fe,L,$,It,kt,Qe,V,gt,Rt=(gt=class{constructor(e,t="/",s=[[]]){_(this,$);w(this,"raw");_(this,fe);_(this,L);w(this,"routeIndex",0);w(this,"path");w(this,"bodyCache",{});_(this,V,e=>{const{bodyCache:t,raw:s}=this,a=t[e];if(a)return a;const r=Object.keys(t)[0];return r?t[r].then(i=>(r==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,y(this,L,s),y(this,fe,{})}param(e){return e?T(this,$,It).call(this,e):T(this,$,kt).call(this)}query(e){return hs(this.url,e)}queries(e){return gs(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,a)=>{t[a]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await is(this,e))}json(){return f(this,V).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,V).call(this,"text")}arrayBuffer(){return f(this,V).call(this,"arrayBuffer")}blob(){return f(this,V).call(this,"blob")}formData(){return f(this,V).call(this,"formData")}addValidatedData(e,t){f(this,fe)[e]=t}valid(e){return f(this,fe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[rs](){return f(this,L)}get matchedRoutes(){return f(this,L)[0].map(([[,e]])=>e)}get routePath(){return f(this,L)[0].map(([[,e]])=>e)[this.routeIndex].path}},fe=new WeakMap,L=new WeakMap,$=new WeakSet,It=function(e){const t=f(this,L)[0][this.routeIndex][1][e],s=T(this,$,Qe).call(this,t);return s&&/\%/.test(s)?nt(s):s},kt=function(){const e={},t=Object.keys(f(this,L)[0][this.routeIndex][1]);for(const s of t){const a=T(this,$,Qe).call(this,f(this,L)[0][this.routeIndex][1][s]);a!==void 0&&(e[s]=/\%/.test(a)?nt(a):a)}return e},Qe=function(e){return f(this,L)[1]?f(this,L)[1][e]:e},V=new WeakMap,gt),bs={Stringify:1},jt=async(e,t,s,a,r)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(r?r[0]+=e:r=[e],Promise.all(i.map(l=>l({phase:t,buffer:r,context:a}))).then(l=>Promise.all(l.filter(Boolean).map(o=>jt(o,t,!1,a,r))).then(()=>r[0]))):Promise.resolve(e)},vs="text/plain; charset=UTF-8",Je=(e,t)=>({"Content-Type":e,...t}),Se,Re,q,xe,F,D,Ie,me,he,te,ke,je,K,de,bt,ys=(bt=class{constructor(e,t){_(this,K);_(this,Se);_(this,Re);w(this,"env",{});_(this,q);w(this,"finalized",!1);w(this,"error");_(this,xe);_(this,F);_(this,D);_(this,Ie);_(this,me);_(this,he);_(this,te);_(this,ke);_(this,je);w(this,"render",(...e)=>(f(this,me)??y(this,me,t=>this.html(t)),f(this,me).call(this,...e)));w(this,"setLayout",e=>y(this,Ie,e));w(this,"getLayout",()=>f(this,Ie));w(this,"setRenderer",e=>{y(this,me,e)});w(this,"header",(e,t,s)=>{this.finalized&&y(this,D,new Response(f(this,D).body,f(this,D)));const a=f(this,D)?f(this,D).headers:f(this,te)??y(this,te,new Headers);t===void 0?a.delete(e):s!=null&&s.append?a.append(e,t):a.set(e,t)});w(this,"status",e=>{y(this,xe,e)});w(this,"set",(e,t)=>{f(this,q)??y(this,q,new Map),f(this,q).set(e,t)});w(this,"get",e=>f(this,q)?f(this,q).get(e):void 0);w(this,"newResponse",(...e)=>T(this,K,de).call(this,...e));w(this,"body",(e,t,s)=>T(this,K,de).call(this,e,t,s));w(this,"text",(e,t,s)=>!f(this,te)&&!f(this,xe)&&!t&&!s&&!this.finalized?new Response(e):T(this,K,de).call(this,e,t,Je(vs,s)));w(this,"json",(e,t,s)=>T(this,K,de).call(this,JSON.stringify(e),t,Je("application/json",s)));w(this,"html",(e,t,s)=>{const a=r=>T(this,K,de).call(this,r,t,Je("text/html; charset=UTF-8",s));return typeof e=="object"?jt(e,bs.Stringify,!1,{}).then(a):a(e)});w(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});w(this,"notFound",()=>(f(this,he)??y(this,he,()=>new Response),f(this,he).call(this,this)));y(this,Se,e),t&&(y(this,F,t.executionCtx),this.env=t.env,y(this,he,t.notFoundHandler),y(this,je,t.path),y(this,ke,t.matchResult))}get req(){return f(this,Re)??y(this,Re,new Rt(f(this,Se),f(this,je),f(this,ke))),f(this,Re)}get event(){if(f(this,F)&&"respondWith"in f(this,F))return f(this,F);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,F))return f(this,F);throw Error("This context has no ExecutionContext")}get res(){return f(this,D)||y(this,D,new Response(null,{headers:f(this,te)??y(this,te,new Headers)}))}set res(e){if(f(this,D)&&e){e=new Response(e.body,e);for(const[t,s]of f(this,D).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const a=f(this,D).headers.getSetCookie();e.headers.delete("set-cookie");for(const r of a)e.headers.append("set-cookie",r)}else e.headers.set(t,s)}y(this,D,e),this.finalized=!0}get var(){return f(this,q)?Object.fromEntries(f(this,q)):{}}},Se=new WeakMap,Re=new WeakMap,q=new WeakMap,xe=new WeakMap,F=new WeakMap,D=new WeakMap,Ie=new WeakMap,me=new WeakMap,he=new WeakMap,te=new WeakMap,ke=new WeakMap,je=new WeakMap,K=new WeakSet,de=function(e,t,s){const a=f(this,D)?new Headers(f(this,D).headers):f(this,te)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[n,l]of i)n.toLowerCase()==="set-cookie"?a.append(n,l):a.set(n,l)}if(s)for(const[i,n]of Object.entries(s))if(typeof n=="string")a.set(i,n);else{a.delete(i);for(const l of n)a.append(i,l)}const r=typeof t=="number"?t:(t==null?void 0:t.status)??f(this,xe);return new Response(e,{status:r,headers:a})},bt),A="ALL",ws="all",_s=["get","post","put","delete","options","patch"],Dt="Can not add a route since the matcher is already built.",Ot=class extends Error{},Es="__COMPOSED_HANDLER",Ts=e=>e.text("404 Not Found",404),ot=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},N,S,Lt,P,Q,Pe,Me,ge,Cs=(ge=class{constructor(t={}){_(this,S);w(this,"get");w(this,"post");w(this,"put");w(this,"delete");w(this,"options");w(this,"patch");w(this,"all");w(this,"on");w(this,"use");w(this,"router");w(this,"getPath");w(this,"_basePath","/");_(this,N,"/");w(this,"routes",[]);_(this,P,Ts);w(this,"errorHandler",ot);w(this,"onError",t=>(this.errorHandler=t,this));w(this,"notFound",t=>(y(this,P,t),this));w(this,"fetch",(t,...s)=>T(this,S,Me).call(this,t,s[1],s[0],t.method));w(this,"request",(t,s,a,r)=>t instanceof Request?this.fetch(s?new Request(t,s):t,a,r):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${ce("/",t)}`,s),a,r)));w(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(T(this,S,Me).call(this,t.request,t,void 0,t.request.method))})});[..._s,ws].forEach(i=>{this[i]=(n,...l)=>(typeof n=="string"?y(this,N,n):T(this,S,Q).call(this,i,f(this,N),n),l.forEach(o=>{T(this,S,Q).call(this,i,f(this,N),o)}),this)}),this.on=(i,n,...l)=>{for(const o of[n].flat()){y(this,N,o);for(const c of[i].flat())l.map(d=>{T(this,S,Q).call(this,c.toUpperCase(),f(this,N),d)})}return this},this.use=(i,...n)=>(typeof i=="string"?y(this,N,i):(y(this,N,"*"),n.unshift(i)),n.forEach(l=>{T(this,S,Q).call(this,A,f(this,N),l)}),this);const{strict:a,...r}=t;Object.assign(this,r),this.getPath=a??!0?t.getPath??Tt:ms}route(t,s){const a=this.basePath(t);return s.routes.map(r=>{var n;let i;s.errorHandler===ot?i=r.handler:(i=async(l,o)=>(await it([],s.errorHandler)(l,()=>r.handler(l,o))).res,i[Es]=r.handler),T(n=a,S,Q).call(n,r.method,r.path,i)}),this}basePath(t){const s=T(this,S,Lt).call(this);return s._basePath=ce(this._basePath,t),s}mount(t,s,a){let r,i;a&&(typeof a=="function"?i=a:(i=a.optionHandler,a.replaceRequest===!1?r=o=>o:r=a.replaceRequest));const n=i?o=>{const c=i(o);return Array.isArray(c)?c:[c]}:o=>{let c;try{c=o.executionCtx}catch{}return[o.env,c]};r||(r=(()=>{const o=ce(this._basePath,t),c=o==="/"?0:o.length;return d=>{const u=new URL(d.url);return u.pathname=u.pathname.slice(c)||"/",new Request(u,d)}})());const l=async(o,c)=>{const d=await s(r(o.req.raw),...n(o));if(d)return d;await c()};return T(this,S,Q).call(this,A,ce(t,"*"),l),this}},N=new WeakMap,S=new WeakSet,Lt=function(){const t=new ge({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,y(t,P,f(this,P)),t.routes=this.routes,t},P=new WeakMap,Q=function(t,s,a){t=t.toUpperCase(),s=ce(this._basePath,s);const r={basePath:this._basePath,path:s,method:t,handler:a};this.router.add(t,s,[a,r]),this.routes.push(r)},Pe=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},Me=function(t,s,a,r){if(r==="HEAD")return(async()=>new Response(null,await T(this,S,Me).call(this,t,s,a,"GET")))();const i=this.getPath(t,{env:a}),n=this.router.match(r,i),l=new ys(t,{path:i,matchResult:n,env:a,executionCtx:s,notFoundHandler:f(this,P)});if(n[0].length===1){let c;try{c=n[0][0][0][0](l,async()=>{l.res=await f(this,P).call(this,l)})}catch(d){return T(this,S,Pe).call(this,d,l)}return c instanceof Promise?c.then(d=>d||(l.finalized?l.res:f(this,P).call(this,l))).catch(d=>T(this,S,Pe).call(this,d,l)):c??f(this,P).call(this,l)}const o=it(n[0],this.errorHandler,f(this,P));return(async()=>{try{const c=await o(l);if(!c.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return c.res}catch(c){return T(this,S,Pe).call(this,c,l)}})()},ge),Nt=[];function As(e,t){const s=this.buildAllMatchers(),a=((r,i)=>{const n=s[r]||s[A],l=n[2][i];if(l)return l;const o=i.match(n[0]);if(!o)return[[],Nt];const c=o.indexOf("",1);return[n[1][c],o]});return this.match=a,a(e,t)}var qe="[^/]+",_e=".*",Ee="(?:|/.*)",ue=Symbol(),Ss=new Set(".\\+*[^]$()");function Rs(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===_e||e===Ee?1:t===_e||t===Ee?-1:e===qe?1:t===qe?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var se,ae,M,ne,Is=(ne=class{constructor(){_(this,se);_(this,ae);_(this,M,Object.create(null))}insert(t,s,a,r,i){if(t.length===0){if(f(this,se)!==void 0)throw ue;if(i)return;y(this,se,s);return}const[n,...l]=t,o=n==="*"?l.length===0?["","",_e]:["","",qe]:n==="/*"?["","",Ee]:n.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let c;if(o){const d=o[1];let u=o[2]||qe;if(d&&o[2]&&(u===".*"||(u=u.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(u))))throw ue;if(c=f(this,M)[u],!c){if(Object.keys(f(this,M)).some(x=>x!==_e&&x!==Ee))throw ue;if(i)return;c=f(this,M)[u]=new ne,d!==""&&y(c,ae,r.varIndex++)}!i&&d!==""&&a.push([d,f(c,ae)])}else if(c=f(this,M)[n],!c){if(Object.keys(f(this,M)).some(d=>d.length>1&&d!==_e&&d!==Ee))throw ue;if(i)return;c=f(this,M)[n]=new ne}c.insert(l,s,a,r,i)}buildRegExpStr(){const s=Object.keys(f(this,M)).sort(Rs).map(a=>{const r=f(this,M)[a];return(typeof f(r,ae)=="number"?`(${a})@${f(r,ae)}`:Ss.has(a)?`\\${a}`:a)+r.buildRegExpStr()});return typeof f(this,se)=="number"&&s.unshift(`#${f(this,se)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},se=new WeakMap,ae=new WeakMap,M=new WeakMap,ne),Fe,De,vt,ks=(vt=class{constructor(){_(this,Fe,{varIndex:0});_(this,De,new Is)}insert(e,t,s){const a=[],r=[];for(let n=0;;){let l=!1;if(e=e.replace(/\{[^}]+\}/g,o=>{const c=`@\\${n}`;return r[n]=[c,o],n++,l=!0,c}),!l)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let n=r.length-1;n>=0;n--){const[l]=r[n];for(let o=i.length-1;o>=0;o--)if(i[o].indexOf(l)!==-1){i[o]=i[o].replace(l,r[n][1]);break}}return f(this,De).insert(i,t,a,f(this,Fe),s),a}buildRegExp(){let e=f(this,De).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],a=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(r,i,n)=>i!==void 0?(s[++t]=Number(i),"$()"):(n!==void 0&&(a[Number(n)]=++t),"")),[new RegExp(`^${e}`),s,a]}},Fe=new WeakMap,De=new WeakMap,vt),js=[/^$/,[],Object.create(null)],Be=Object.create(null);function Pt(e){return Be[e]??(Be[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Ds(){Be=Object.create(null)}function Os(e){var c;const t=new ks,s=[];if(e.length===0)return js;const a=e.map(d=>[!/\*|\/:/.test(d[0]),...d]).sort(([d,u],[x,p])=>d?1:x?-1:u.length-p.length),r=Object.create(null);for(let d=0,u=-1,x=a.length;d<x;d++){const[p,m,h]=a[d];p?r[m]=[h.map(([v])=>[v,Object.create(null)]),Nt]:u++;let b;try{b=t.insert(m,u,p)}catch(v){throw v===ue?new Ot(m):v}p||(s[u]=h.map(([v,E])=>{const C=Object.create(null);for(E-=1;E>=0;E--){const[k,R]=b[E];C[k]=R}return[v,C]}))}const[i,n,l]=t.buildRegExp();for(let d=0,u=s.length;d<u;d++)for(let x=0,p=s[d].length;x<p;x++){const m=(c=s[d][x])==null?void 0:c[1];if(!m)continue;const h=Object.keys(m);for(let b=0,v=h.length;b<v;b++)m[h[b]]=l[m[h[b]]]}const o=[];for(const d in n)o[d]=s[n[d]];return[i,o,r]}function oe(e,t){if(e){for(const s of Object.keys(e).sort((a,r)=>r.length-a.length))if(Pt(s).test(t))return[...e[s]]}}var J,Y,He,Mt,yt,Ls=(yt=class{constructor(){_(this,He);w(this,"name","RegExpRouter");_(this,J);_(this,Y);w(this,"match",As);y(this,J,{[A]:Object.create(null)}),y(this,Y,{[A]:Object.create(null)})}add(e,t,s){var l;const a=f(this,J),r=f(this,Y);if(!a||!r)throw new Error(Dt);a[e]||[a,r].forEach(o=>{o[e]=Object.create(null),Object.keys(o[A]).forEach(c=>{o[e][c]=[...o[A][c]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const o=Pt(t);e===A?Object.keys(a).forEach(c=>{var d;(d=a[c])[t]||(d[t]=oe(a[c],t)||oe(a[A],t)||[])}):(l=a[e])[t]||(l[t]=oe(a[e],t)||oe(a[A],t)||[]),Object.keys(a).forEach(c=>{(e===A||e===c)&&Object.keys(a[c]).forEach(d=>{o.test(d)&&a[c][d].push([s,i])})}),Object.keys(r).forEach(c=>{(e===A||e===c)&&Object.keys(r[c]).forEach(d=>o.test(d)&&r[c][d].push([s,i]))});return}const n=Ct(t)||[t];for(let o=0,c=n.length;o<c;o++){const d=n[o];Object.keys(r).forEach(u=>{var x;(e===A||e===u)&&((x=r[u])[d]||(x[d]=[...oe(a[u],d)||oe(a[A],d)||[]]),r[u][d].push([s,i-c+o+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(f(this,Y)).concat(Object.keys(f(this,J))).forEach(t=>{e[t]||(e[t]=T(this,He,Mt).call(this,t))}),y(this,J,y(this,Y,void 0)),Ds(),e}},J=new WeakMap,Y=new WeakMap,He=new WeakSet,Mt=function(e){const t=[];let s=e===A;return[f(this,J),f(this,Y)].forEach(a=>{const r=a[e]?Object.keys(a[e]).map(i=>[i,a[e][i]]):[];r.length!==0?(s||(s=!0),t.push(...r)):e!==A&&t.push(...Object.keys(a[A]).map(i=>[i,a[A][i]]))}),s?Os(t):null},yt),X,H,wt,Ns=(wt=class{constructor(e){w(this,"name","SmartRouter");_(this,X,[]);_(this,H,[]);y(this,X,e.routers)}add(e,t,s){if(!f(this,H))throw new Error(Dt);f(this,H).push([e,t,s])}match(e,t){if(!f(this,H))throw new Error("Fatal error");const s=f(this,X),a=f(this,H),r=s.length;let i=0,n;for(;i<r;i++){const l=s[i];try{for(let o=0,c=a.length;o<c;o++)l.add(...a[o]);n=l.match(e,t)}catch(o){if(o instanceof Ot)continue;throw o}this.match=l.match.bind(l),y(this,X,[l]),y(this,H,void 0);break}if(i===r)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,n}get activeRouter(){if(f(this,H)||f(this,X).length!==1)throw new Error("No active router has been determined yet.");return f(this,X)[0]}},X=new WeakMap,H=new WeakMap,wt),we=Object.create(null),Z,j,re,be,I,U,ee,ve,Ps=(ve=class{constructor(t,s,a){_(this,U);_(this,Z);_(this,j);_(this,re);_(this,be,0);_(this,I,we);if(y(this,j,a||Object.create(null)),y(this,Z,[]),t&&s){const r=Object.create(null);r[t]={handler:s,possibleKeys:[],score:0},y(this,Z,[r])}y(this,re,[])}insert(t,s,a){y(this,be,++rt(this,be)._);let r=this;const i=ds(s),n=[];for(let l=0,o=i.length;l<o;l++){const c=i[l],d=i[l+1],u=fs(c,d),x=Array.isArray(u)?u[0]:c;if(x in f(r,j)){r=f(r,j)[x],u&&n.push(u[1]);continue}f(r,j)[x]=new ve,u&&(f(r,re).push(u),n.push(u[1])),r=f(r,j)[x]}return f(r,Z).push({[t]:{handler:a,possibleKeys:n.filter((l,o,c)=>c.indexOf(l)===o),score:f(this,be)}}),r}search(t,s){var o;const a=[];y(this,I,we);let i=[this];const n=Et(s),l=[];for(let c=0,d=n.length;c<d;c++){const u=n[c],x=c===d-1,p=[];for(let m=0,h=i.length;m<h;m++){const b=i[m],v=f(b,j)[u];v&&(y(v,I,f(b,I)),x?(f(v,j)["*"]&&a.push(...T(this,U,ee).call(this,f(v,j)["*"],t,f(b,I))),a.push(...T(this,U,ee).call(this,v,t,f(b,I)))):p.push(v));for(let E=0,C=f(b,re).length;E<C;E++){const k=f(b,re)[E],R=f(b,I)===we?{}:{...f(b,I)};if(k==="*"){const W=f(b,j)["*"];W&&(a.push(...T(this,U,ee).call(this,W,t,f(b,I))),y(W,I,R),p.push(W));continue}const[Le,ye,z]=k;if(!u&&!(z instanceof RegExp))continue;const O=f(b,j)[Le],We=n.slice(c).join("/");if(z instanceof RegExp){const W=z.exec(We);if(W){if(R[ye]=W[0],a.push(...T(this,U,ee).call(this,O,t,f(b,I),R)),Object.keys(f(O,j)).length){y(O,I,R);const Ge=((o=W[0].match(/\//))==null?void 0:o.length)??0;(l[Ge]||(l[Ge]=[])).push(O)}continue}}(z===!0||z.test(u))&&(R[ye]=u,x?(a.push(...T(this,U,ee).call(this,O,t,R,f(b,I))),f(O,j)["*"]&&a.push(...T(this,U,ee).call(this,f(O,j)["*"],t,R,f(b,I)))):(y(O,I,R),p.push(O)))}}i=p.concat(l.shift()??[])}return a.length>1&&a.sort((c,d)=>c.score-d.score),[a.map(({handler:c,params:d})=>[c,d])]}},Z=new WeakMap,j=new WeakMap,re=new WeakMap,be=new WeakMap,I=new WeakMap,U=new WeakSet,ee=function(t,s,a,r){const i=[];for(let n=0,l=f(t,Z).length;n<l;n++){const o=f(t,Z)[n],c=o[s]||o[A],d={};if(c!==void 0&&(c.params=Object.create(null),i.push(c),a!==we||r&&r!==we))for(let u=0,x=c.possibleKeys.length;u<x;u++){const p=c.possibleKeys[u],m=d[c.score];c.params[p]=r!=null&&r[p]&&!m?r[p]:a[p]??(r==null?void 0:r[p]),d[c.score]=!0}}return i},ve),ie,_t,Ms=(_t=class{constructor(){w(this,"name","TrieRouter");_(this,ie);y(this,ie,new Ps)}add(e,t,s){const a=Ct(t);if(a){for(let r=0,i=a.length;r<i;r++)f(this,ie).insert(e,a[r],s);return}f(this,ie).insert(e,t,s)}match(e,t){return f(this,ie).search(e,t)}},ie=new WeakMap,_t),Bt=class extends Cs{constructor(e={}){super(e),this.router=e.router??new Ns({routers:[new Ls,new Ms]})}},Bs=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},a=(i=>typeof i=="string"?i==="*"?()=>i:n=>i===n?n:null:typeof i=="function"?i:n=>i.includes(n)?n:null)(s.origin),r=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(s.allowMethods);return async function(n,l){var d;function o(u,x){n.res.headers.set(u,x)}const c=await a(n.req.header("origin")||"",n);if(c&&o("Access-Control-Allow-Origin",c),s.credentials&&o("Access-Control-Allow-Credentials","true"),(d=s.exposeHeaders)!=null&&d.length&&o("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),n.req.method==="OPTIONS"){s.origin!=="*"&&o("Vary","Origin"),s.maxAge!=null&&o("Access-Control-Max-Age",s.maxAge.toString());const u=await r(n.req.header("origin")||"",n);u.length&&o("Access-Control-Allow-Methods",u.join(","));let x=s.allowHeaders;if(!(x!=null&&x.length)){const p=n.req.header("Access-Control-Request-Headers");p&&(x=p.split(/\s*,\s*/))}return x!=null&&x.length&&(o("Access-Control-Allow-Headers",x.join(",")),n.res.headers.append("Vary","Access-Control-Request-Headers")),n.res.headers.delete("Content-Length"),n.res.headers.delete("Content-Type"),new Response(null,{headers:n.res.headers,status:204,statusText:"No Content"})}await l(),s.origin!=="*"&&n.header("Vary","Origin",{append:!0})}},qs=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,lt=(e,t=Hs)=>{const s=/\.([a-zA-Z0-9]+?)$/,a=e.match(s);if(!a)return;let r=t[a[1]];return r&&r.startsWith("text")&&(r+="; charset=utf-8"),r},Fs={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},Hs=Fs,Us=(...e)=>{let t=e.filter(r=>r!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),a=[];for(const r of s)r===".."&&a.length>0&&a.at(-1)!==".."?a.pop():r!=="."&&a.push(r);return a.join("/")||"."},qt={br:".br",zstd:".zst",gzip:".gz"},$s=Object.keys(qt),zs="index.html",Ws=e=>{const t=e.root??"./",s=e.path,a=e.join??Us;return async(r,i)=>{var d,u,x,p;if(r.finalized)return i();let n;if(e.path)n=e.path;else try{if(n=decodeURIComponent(r.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(n))throw new Error}catch{return await((d=e.onNotFound)==null?void 0:d.call(e,r.req.path,r)),i()}let l=a(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(n):n);e.isDir&&await e.isDir(l)&&(l=a(l,zs));const o=e.getContent;let c=await o(l,r);if(c instanceof Response)return r.newResponse(c.body,c);if(c){const m=e.mimes&&lt(l,e.mimes)||lt(l);if(r.header("Content-Type",m||"application/octet-stream"),e.precompressed&&(!m||qs.test(m))){const h=new Set((u=r.req.header("Accept-Encoding"))==null?void 0:u.split(",").map(b=>b.trim()));for(const b of $s){if(!h.has(b))continue;const v=await o(l+qt[b],r);if(v){c=v,r.header("Content-Encoding",b),r.header("Vary","Accept-Encoding",{append:!0});break}}}return await((x=e.onFound)==null?void 0:x.call(e,l,r)),r.body(c)}await((p=e.onNotFound)==null?void 0:p.call(e,l,r)),await i()}},Gs=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let a;t&&t.namespace?a=t.namespace:a=__STATIC_CONTENT;const r=s[e]||e;if(!r)return null;const i=await a.get(r,{type:"stream"});return i||null},Vs=e=>async function(s,a){return Ws({...e,getContent:async i=>Gs(i,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,a)},Ks=e=>Vs(e),Ft=e=>Ut(e.replace(/_|-/g,t=>({_:"/","-":"+"})[t]??t)),Ht=e=>Js(e).replace(/\/|\+/g,t=>({"/":"_","+":"-"})[t]??t),Js=e=>{let t="";const s=new Uint8Array(e);for(let a=0,r=s.length;a<r;a++)t+=String.fromCharCode(s[a]);return btoa(t)},Ut=e=>{const t=atob(e),s=new Uint8Array(new ArrayBuffer(t.length)),a=t.length/2;for(let r=0,i=t.length-1;r<=a;r++,i--)s[r]=t.charCodeAt(r),s[i]=t.charCodeAt(i);return s},$t=(e=>(e.HS256="HS256",e.HS384="HS384",e.HS512="HS512",e.RS256="RS256",e.RS384="RS384",e.RS512="RS512",e.PS256="PS256",e.PS384="PS384",e.PS512="PS512",e.ES256="ES256",e.ES384="ES384",e.ES512="ES512",e.EdDSA="EdDSA",e))($t||{}),Ys={deno:"Deno",bun:"Bun",workerd:"Cloudflare-Workers",node:"Node.js"},Xs=()=>{var s,a;const e=globalThis;if(typeof navigator<"u"&&typeof navigator.userAgent=="string"){for(const[r,i]of Object.entries(Ys))if(Zs(i))return r}return typeof(e==null?void 0:e.EdgeRuntime)=="string"?"edge-light":(e==null?void 0:e.fastly)!==void 0?"fastly":((a=(s=e==null?void 0:e.process)==null?void 0:s.release)==null?void 0:a.name)==="node"?"node":"other"},Zs=e=>navigator.userAgent.startsWith(e),Qs=class extends Error{constructor(e){super(`${e} is not an implemented algorithm`),this.name="JwtAlgorithmNotImplemented"}},zt=class extends Error{constructor(e){super(`invalid JWT token: ${e}`),this.name="JwtTokenInvalid"}},ea=class extends Error{constructor(e){super(`token (${e}) is being used before it's valid`),this.name="JwtTokenNotBefore"}},ta=class extends Error{constructor(e){super(`token (${e}) expired`),this.name="JwtTokenExpired"}},sa=class extends Error{constructor(e,t){super(`Invalid "iat" claim, must be a valid number lower than "${e}" (iat: "${t}")`),this.name="JwtTokenIssuedAt"}},Ye=class extends Error{constructor(e,t){super(`expected issuer "${e}", got ${t?`"${t}"`:"none"} `),this.name="JwtTokenIssuer"}},aa=class extends Error{constructor(e){super(`jwt header is invalid: ${JSON.stringify(e)}`),this.name="JwtHeaderInvalid"}},ra=class extends Error{constructor(e){super(`token(${e}) signature mismatched`),this.name="JwtTokenSignatureMismatched"}},ia=class extends Error{constructor(e){super(`required "aud" in jwt payload: ${JSON.stringify(e)}`),this.name="JwtPayloadRequiresAud"}},na=class extends Error{constructor(e,t){super(`expected audience "${Array.isArray(e)?e.join(", "):e}", got "${t}"`),this.name="JwtTokenAudience"}},Te=(e=>(e.Encrypt="encrypt",e.Decrypt="decrypt",e.Sign="sign",e.Verify="verify",e.DeriveKey="deriveKey",e.DeriveBits="deriveBits",e.WrapKey="wrapKey",e.UnwrapKey="unwrapKey",e))(Te||{}),Oe=new TextEncoder,oa=new TextDecoder;async function la(e,t,s){const a=Wt(t),r=await da(e,a);return await crypto.subtle.sign(a,r,s)}async function ca(e,t,s,a){const r=Wt(t),i=await ua(e,r);return await crypto.subtle.verify(r,i,s,a)}function et(e){return Ut(e.replace(/-+(BEGIN|END).*/g,"").replace(/\s/g,""))}async function da(e,t){if(!crypto.subtle||!crypto.subtle.importKey)throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");if(Gt(e)){if(e.type!=="private"&&e.type!=="secret")throw new Error(`unexpected key type: CryptoKey.type is ${e.type}, expected private or secret`);return e}const s=[Te.Sign];return typeof e=="object"?await crypto.subtle.importKey("jwk",e,t,!1,s):e.includes("PRIVATE")?await crypto.subtle.importKey("pkcs8",et(e),t,!1,s):await crypto.subtle.importKey("raw",Oe.encode(e),t,!1,s)}async function ua(e,t){if(!crypto.subtle||!crypto.subtle.importKey)throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");if(Gt(e)){if(e.type==="public"||e.type==="secret")return e;e=await ct(e)}if(typeof e=="string"&&e.includes("PRIVATE")){const a=await crypto.subtle.importKey("pkcs8",et(e),t,!0,[Te.Sign]);e=await ct(a)}const s=[Te.Verify];return typeof e=="object"?await crypto.subtle.importKey("jwk",e,t,!1,s):e.includes("PUBLIC")?await crypto.subtle.importKey("spki",et(e),t,!1,s):await crypto.subtle.importKey("raw",Oe.encode(e),t,!1,s)}async function ct(e){if(e.type!=="private")throw new Error(`unexpected key type: ${e.type}`);if(!e.extractable)throw new Error("unexpected private key is unextractable");const t=await crypto.subtle.exportKey("jwk",e),{kty:s}=t,{alg:a,e:r,n:i}=t,{crv:n,x:l,y:o}=t;return{kty:s,alg:a,e:r,n:i,crv:n,x:l,y:o,key_ops:[Te.Verify]}}function Wt(e){switch(e){case"HS256":return{name:"HMAC",hash:{name:"SHA-256"}};case"HS384":return{name:"HMAC",hash:{name:"SHA-384"}};case"HS512":return{name:"HMAC",hash:{name:"SHA-512"}};case"RS256":return{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}};case"RS384":return{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-384"}};case"RS512":return{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-512"}};case"PS256":return{name:"RSA-PSS",hash:{name:"SHA-256"},saltLength:32};case"PS384":return{name:"RSA-PSS",hash:{name:"SHA-384"},saltLength:48};case"PS512":return{name:"RSA-PSS",hash:{name:"SHA-512"},saltLength:64};case"ES256":return{name:"ECDSA",hash:{name:"SHA-256"},namedCurve:"P-256"};case"ES384":return{name:"ECDSA",hash:{name:"SHA-384"},namedCurve:"P-384"};case"ES512":return{name:"ECDSA",hash:{name:"SHA-512"},namedCurve:"P-521"};case"EdDSA":return{name:"Ed25519",namedCurve:"Ed25519"};default:throw new Qs(e)}}function Gt(e){return Xs()==="node"&&crypto.webcrypto?e instanceof crypto.webcrypto.CryptoKey:e instanceof CryptoKey}var Xe=e=>Ht(Oe.encode(JSON.stringify(e)).buffer).replace(/=/g,""),pa=e=>Ht(e).replace(/=/g,""),dt=e=>JSON.parse(oa.decode(Ft(e)));function fa(e){if(typeof e=="object"&&e!==null){const t=e;return"alg"in t&&Object.values($t).includes(t.alg)&&(!("typ"in t)||t.typ==="JWT")}return!1}var xa=async(e,t,s="HS256")=>{const a=Xe(e);let r;typeof t=="object"&&"alg"in t?(s=t.alg,r=Xe({alg:s,typ:"JWT",kid:t.kid})):r=Xe({alg:s,typ:"JWT"});const i=`${r}.${a}`,n=await la(t,s,Oe.encode(i)),l=pa(n);return`${i}.${l}`},ma=async(e,t,s)=>{const{alg:a="HS256",iss:r,nbf:i=!0,exp:n=!0,iat:l=!0,aud:o}=typeof s=="string"?{alg:s}:s||{},c=e.split(".");if(c.length!==3)throw new zt(e);const{header:d,payload:u}=ha(e);if(!fa(d))throw new aa(d);const x=Date.now()/1e3|0;if(i&&u.nbf&&u.nbf>x)throw new ea(e);if(n&&u.exp&&u.exp<=x)throw new ta(e);if(l&&u.iat&&x<u.iat)throw new sa(x,u.iat);if(r){if(!u.iss)throw new Ye(r,null);if(typeof r=="string"&&u.iss!==r)throw new Ye(r,u.iss);if(r instanceof RegExp&&!r.test(u.iss))throw new Ye(r,u.iss)}if(o){if(!u.aud)throw new ia(u);if(!(Array.isArray(u.aud)?u.aud:[u.aud]).some(v=>o instanceof RegExp?o.test(v):typeof o=="string"?v===o:Array.isArray(o)&&o.includes(v)))throw new na(o,u.aud)}const p=e.substring(0,e.lastIndexOf("."));if(!await ca(t,a,Ft(c[2]),Oe.encode(p)))throw new ra(e);return u},ha=e=>{try{const[t,s]=e.split("."),a=dt(t),r=dt(s);return{header:a,payload:r}}catch{throw new zt(e)}},Vt={sign:xa,verify:ma},Kt=Vt.verify,Jt=Vt.sign;function ga(e){try{return crypto.getRandomValues(new Uint8Array(e))}catch{}try{return as.randomBytes(e)}catch{}throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative")}function ba(e,t){if(e=e||Xt,typeof e!="number")throw Error("Illegal arguments: "+typeof e+", "+typeof t);e<4?e=4:e>31&&(e=31);var s=[];return s.push("$2b$"),e<10&&s.push("0"),s.push(e.toString()),s.push("$"),s.push(tt(ga(Ce),Ce)),s.join("")}function va(e,t,s){if(typeof t=="function"&&(s=t,t=void 0),typeof e=="function"&&(s=e,e=void 0),typeof e>"u")e=Xt;else if(typeof e!="number")throw Error("illegal arguments: "+typeof e);function a(r){B(function(){try{r(null,ba(e))}catch(i){r(i)}})}if(s){if(typeof s!="function")throw Error("Illegal callback: "+typeof s);a(s)}else return new Promise(function(r,i){a(function(n,l){if(n){i(n);return}r(l)})})}function Yt(e,t,s,a){function r(i){typeof e=="string"&&typeof t=="number"?va(t,function(n,l){mt(e,l,i,a)}):typeof e=="string"&&typeof t=="string"?mt(e,t,i,a):B(i.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)))}if(s){if(typeof s!="function")throw Error("Illegal callback: "+typeof s);r(s)}else return new Promise(function(i,n){r(function(l,o){if(l){n(l);return}i(o)})})}function ya(e,t){for(var s=e.length^t.length,a=0;a<e.length;++a)s|=e.charCodeAt(a)^t.charCodeAt(a);return s===0}function wa(e,t,s,a){function r(i){if(typeof e!="string"||typeof t!="string"){B(i.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)));return}if(t.length!==60){B(i.bind(this,null,!1));return}Yt(e,t.substring(0,29),function(n,l){n?i(n):i(null,ya(l,t))},a)}if(s){if(typeof s!="function")throw Error("Illegal callback: "+typeof s);r(s)}else return new Promise(function(i,n){r(function(l,o){if(l){n(l);return}i(o)})})}var B=typeof setImmediate=="function"?setImmediate:typeof scheduler=="object"&&typeof scheduler.postTask=="function"?scheduler.postTask.bind(scheduler):setTimeout;function _a(e){for(var t=0,s=0,a=0;a<e.length;++a)s=e.charCodeAt(a),s<128?t+=1:s<2048?t+=2:(s&64512)===55296&&(e.charCodeAt(a+1)&64512)===56320?(++a,t+=4):t+=3;return t}function Ea(e){for(var t=0,s,a,r=new Array(_a(e)),i=0,n=e.length;i<n;++i)s=e.charCodeAt(i),s<128?r[t++]=s:s<2048?(r[t++]=s>>6|192,r[t++]=s&63|128):(s&64512)===55296&&((a=e.charCodeAt(i+1))&64512)===56320?(s=65536+((s&1023)<<10)+(a&1023),++i,r[t++]=s>>18|240,r[t++]=s>>12&63|128,r[t++]=s>>6&63|128,r[t++]=s&63|128):(r[t++]=s>>12|224,r[t++]=s>>6&63|128,r[t++]=s&63|128);return r}var le="./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),G=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,54,55,56,57,58,59,60,61,62,63,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,-1,-1,-1,-1,-1];function tt(e,t){var s=0,a=[],r,i;if(t<=0||t>e.length)throw Error("Illegal len: "+t);for(;s<t;){if(r=e[s++]&255,a.push(le[r>>2&63]),r=(r&3)<<4,s>=t){a.push(le[r&63]);break}if(i=e[s++]&255,r|=i>>4&15,a.push(le[r&63]),r=(i&15)<<2,s>=t){a.push(le[r&63]);break}i=e[s++]&255,r|=i>>6&3,a.push(le[r&63]),a.push(le[i&63])}return a.join("")}function Ta(e,t){for(var s=0,a=e.length,r=0,i=[],n,l,o,c,d,u;s<a-1&&r<t&&(u=e.charCodeAt(s++),n=u<G.length?G[u]:-1,u=e.charCodeAt(s++),l=u<G.length?G[u]:-1,!(n==-1||l==-1||(d=n<<2>>>0,d|=(l&48)>>4,i.push(String.fromCharCode(d)),++r>=t||s>=a)||(u=e.charCodeAt(s++),o=u<G.length?G[u]:-1,o==-1)||(d=(l&15)<<4>>>0,d|=(o&60)>>2,i.push(String.fromCharCode(d)),++r>=t||s>=a)));)u=e.charCodeAt(s++),c=u<G.length?G[u]:-1,d=(o&3)<<6>>>0,d|=c,i.push(String.fromCharCode(d)),++r;var x=[];for(s=0;s<r;s++)x.push(i[s].charCodeAt(0));return x}var Ce=16,Xt=10,Ca=16,Aa=100,ut=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],pt=[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946,1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055,3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504,976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462],Zt=[1332899944,1700884034,1701343084,1684370003,1668446532,1869963892];function Ae(e,t,s,a){var r,i=e[t],n=e[t+1];return i^=s[0],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[1],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[2],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[3],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[4],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[5],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[6],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[7],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[8],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[9],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[10],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[11],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[12],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[13],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[14],r=a[i>>>24],r+=a[256|i>>16&255],r^=a[512|i>>8&255],r+=a[768|i&255],n^=r^s[15],r=a[n>>>24],r+=a[256|n>>16&255],r^=a[512|n>>8&255],r+=a[768|n&255],i^=r^s[16],e[t]=n^s[Ca+1],e[t+1]=i,e}function pe(e,t){for(var s=0,a=0;s<4;++s)a=a<<8|e[t]&255,t=(t+1)%e.length;return{key:a,offp:t}}function ft(e,t,s){for(var a=0,r=[0,0],i=t.length,n=s.length,l,o=0;o<i;o++)l=pe(e,a),a=l.offp,t[o]=t[o]^l.key;for(o=0;o<i;o+=2)r=Ae(r,0,t,s),t[o]=r[0],t[o+1]=r[1];for(o=0;o<n;o+=2)r=Ae(r,0,t,s),s[o]=r[0],s[o+1]=r[1]}function Sa(e,t,s,a){for(var r=0,i=[0,0],n=s.length,l=a.length,o,c=0;c<n;c++)o=pe(t,r),r=o.offp,s[c]=s[c]^o.key;for(r=0,c=0;c<n;c+=2)o=pe(e,r),r=o.offp,i[0]^=o.key,o=pe(e,r),r=o.offp,i[1]^=o.key,i=Ae(i,0,s,a),s[c]=i[0],s[c+1]=i[1];for(c=0;c<l;c+=2)o=pe(e,r),r=o.offp,i[0]^=o.key,o=pe(e,r),r=o.offp,i[1]^=o.key,i=Ae(i,0,s,a),a[c]=i[0],a[c+1]=i[1]}function xt(e,t,s,a,r){var i=Zt.slice(),n=i.length,l;if(s<4||s>31)if(l=Error("Illegal number of rounds (4-31): "+s),a){B(a.bind(this,l));return}else throw l;if(t.length!==Ce)if(l=Error("Illegal salt length: "+t.length+" != "+Ce),a){B(a.bind(this,l));return}else throw l;s=1<<s>>>0;var o,c,d=0,u;typeof Int32Array=="function"?(o=new Int32Array(ut),c=new Int32Array(pt)):(o=ut.slice(),c=pt.slice()),Sa(t,e,o,c);function x(){if(r&&r(d/s),d<s)for(var m=Date.now();d<s&&(d=d+1,ft(e,o,c),ft(t,o,c),!(Date.now()-m>Aa)););else{for(d=0;d<64;d++)for(u=0;u<n>>1;u++)Ae(i,u<<1,o,c);var h=[];for(d=0;d<n;d++)h.push((i[d]>>24&255)>>>0),h.push((i[d]>>16&255)>>>0),h.push((i[d]>>8&255)>>>0),h.push((i[d]&255)>>>0);if(a){a(null,h);return}else return h}a&&B(x)}if(typeof a<"u")x();else for(var p;;)if(typeof(p=x())<"u")return p||[]}function mt(e,t,s,a){var r;if(typeof e!="string"||typeof t!="string")if(r=Error("Invalid string / salt: Not a string"),s){B(s.bind(this,r));return}else throw r;var i,n;if(t.charAt(0)!=="$"||t.charAt(1)!=="2")if(r=Error("Invalid salt version: "+t.substring(0,2)),s){B(s.bind(this,r));return}else throw r;if(t.charAt(2)==="$")i="\0",n=3;else{if(i=t.charAt(2),i!=="a"&&i!=="b"&&i!=="y"||t.charAt(3)!=="$")if(r=Error("Invalid salt revision: "+t.substring(2,4)),s){B(s.bind(this,r));return}else throw r;n=4}if(t.charAt(n+2)>"$")if(r=Error("Missing salt rounds"),s){B(s.bind(this,r));return}else throw r;var l=parseInt(t.substring(n,n+1),10)*10,o=parseInt(t.substring(n+1,n+2),10),c=l+o,d=t.substring(n+3,n+25);e+=i>="a"?"\0":"";var u=Ea(e),x=Ta(d,Ce);function p(m){var h=[];return h.push("$2"),i>="a"&&h.push(i),h.push("$"),c<10&&h.push("0"),h.push(c.toString()),h.push("$"),h.push(tt(x,x.length)),h.push(tt(m,Zt.length*4-1)),h.join("")}if(typeof s>"u")return p(xt(u,x,c));xt(u,x,c,function(m,h){m?s(m,null):s(null,p(h))},a)}const g=new Bt,Ue="amanah-go-secret-key-change-in-production",$e=async(e,t)=>{try{const s=e.req.header("Authorization");if(!s||!s.startsWith("Bearer "))return e.json({error:"Token manquant"},401);const a=s.substring(7),r=e.env.JWT_SECRET||Ue,i=await Kt(a,r);if(!i||!i.id)return e.json({error:"Token invalide"},401);const{DB:n}=e.env,l=await n.prepare("SELECT id, email, name, kyc_status, phone, rating FROM users WHERE id = ?").bind(i.id).first();if(!l)return e.json({error:"Utilisateur non trouvé"},401);e.set("user",l),await t()}catch(s){return console.error("Auth middleware error:",s),e.json({error:"Token invalide ou expiré"},401)}};g.use("/api/*",Bs());g.use("/static/*",Ks({root:"./public"}));g.get("/manifest.json",e=>e.json({name:"Amanah GO - Transport Collaboratif France ↔ Maroc",short_name:"Amanah GO",description:"Plateforme de transport collaboratif de colis entre la France et le Maroc. Voyagez malin, envoyez futé !",start_url:"/",display:"standalone",background_color:"#ffffff",theme_color:"#2563eb",orientation:"portrait-primary",scope:"/",icons:[{src:"/static/icons/icon-72x72.png",sizes:"72x72",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-96x96.png",sizes:"96x96",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-128x128.png",sizes:"128x128",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-144x144.png",sizes:"144x144",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-152x152.png",sizes:"152x152",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-192x192.png",sizes:"192x192",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-384x384.png",sizes:"384x384",type:"image/png",purpose:"any maskable"},{src:"/static/icons/icon-512x512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"}],categories:["travel","business","logistics"],lang:"fr",dir:"auto",prefer_related_applications:!1,shortcuts:[{name:"Publier un trajet",short_name:"Trajet",description:"Publier un nouveau trajet",url:"/voyageur/publier-trajet",icons:[{src:"/static/icons/icon-192x192.png",sizes:"192x192"}]},{name:"Publier un colis",short_name:"Colis",description:"Publier un nouveau colis",url:"/expediteur/publier-colis",icons:[{src:"/static/icons/icon-192x192.png",sizes:"192x192"}]},{name:"Rechercher",short_name:"Recherche",description:"Rechercher un trajet ou colis",url:"/search",icons:[{src:"/static/icons/icon-192x192.png",sizes:"192x192"}]}]}));g.get("/sw.js",e=>e.text(`// Service Worker pour Amanah GO PWA
const CACHE_NAME = 'amanah-go-v1';
const RUNTIME_CACHE = 'amanah-go-runtime';

const PRECACHE_URLS = [
  '/',
  '/voyageur',
  '/expediteur',
  '/search',
  '/static/i18n.js',
  '/static/lang-switcher.js',
  '/static/locales/fr.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});`,200,{"Content-Type":"application/javascript","Service-Worker-Allowed":"/"}));g.get("/test-i18n",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test i18n - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <a href="/" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <!-- Test Section -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-language text-blue-600 mr-3"></i>
                    Test Multi-langue (i18n)
                </h1>
                <p class="text-gray-600 mb-6">
                    Testez le système de traduction en changeant la langue via le menu en haut à droite.
                </p>

                <!-- Common translations -->
                <div class="space-y-4">
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Common</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div><span class="font-medium">Login:</span> <span data-i18n="common.login"></span></div>
                            <div><span class="font-medium">Signup:</span> <span data-i18n="common.signup"></span></div>
                            <div><span class="font-medium">Loading:</span> <span data-i18n="common.loading"></span></div>
                            <div><span class="font-medium">Search:</span> <span data-i18n="common.search"></span></div>
                        </div>
                    </div>

                    <!-- Nav translations -->
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Navigation</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div><span class="font-medium">How it works:</span> <span data-i18n="nav.how_it_works"></span></div>
                            <div><span class="font-medium">Security:</span> <span data-i18n="nav.security"></span></div>
                            <div><span class="font-medium">Pricing:</span> <span data-i18n="nav.pricing"></span></div>
                            <div><span class="font-medium">Traveler Space:</span> <span data-i18n="nav.traveler_space"></span></div>
                        </div>
                    </div>

                    <!-- Traveler translations -->
                    <div class="border-b pb-4">
                        <h3 class="font-semibold text-lg mb-3">Traveler Space</h3>
                        <div class="space-y-2">
                            <div><span class="font-medium">Welcome:</span> <span data-i18n="traveler.welcome"></span></div>
                            <div><span class="font-medium">Subtitle:</span> <span data-i18n="traveler.welcome_subtitle"></span></div>
                            <div><span class="font-medium">Publish Trip:</span> <span data-i18n="traveler.publish_trip"></span></div>
                            <div><span class="font-medium">My Trips:</span> <span data-i18n="traveler.my_trips"></span></div>
                        </div>
                    </div>

                    <!-- Sender translations -->
                    <div>
                        <h3 class="font-semibold text-lg mb-3">Sender Space</h3>
                        <div class="space-y-2">
                            <div><span class="font-medium">Welcome:</span> <span data-i18n="sender.welcome"></span></div>
                            <div><span class="font-medium">Subtitle:</span> <span data-i18n="sender.welcome_subtitle"></span></div>
                            <div><span class="font-medium">Publish Package:</span> <span data-i18n="sender.publish_package"></span></div>
                            <div><span class="font-medium">Search Trip:</span> <span data-i18n="sender.search_trip"></span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Direction Test -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-arrows-alt-h text-green-600 mr-3"></i>
                    Test RTL (Arabic)
                </h2>
                <p class="text-gray-600 mb-4">
                    Passez en arabe pour voir le layout s'inverser automatiquement (direction RTL).
                </p>
                <div class="flex items-center gap-4">
                    <div class="flex-1 p-4 bg-blue-50 rounded-lg">
                        <i class="fas fa-arrow-right mr-2"></i>
                        <span>LTR (Français/English)</span>
                    </div>
                    <div class="flex-1 p-4 bg-green-50 rounded-lg">
                        <i class="fas fa-arrow-left ml-2"></i>
                        <span>RTL (العربية)</span>
                    </div>
                </div>
            </div>
        </div>

        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
          // Wait for i18n to load
          window.addEventListener('DOMContentLoaded', async () => {
            // Initialize i18n first
            await window.i18n.init()
            
            // Inject language switcher
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations to all elements with data-i18n attribute
            applyTranslations()
          })

          function applyTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
          }
        <\/script>
    </body>
    </html>
  `));g.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amanah GO - Transport Collaboratif France ↔ Maroc</title>
        
        <!-- PWA Meta Tags -->
        <meta name="description" content="Plateforme de transport collaboratif de colis entre la France et le Maroc. Voyagez malin, envoyez futé !">
        <meta name="theme-color" content="#2563eb">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Amanah GO">
        
        <!-- Manifest -->
        <link rel="manifest" href="/manifest.json">
        
        <!-- Icons -->
        <link rel="icon" type="image/svg+xml" href="/static/icons/icon.svg">
        <link rel="apple-touch-icon" href="/static/icons/icon-180x180.png">
        <link rel="icon" sizes="192x192" href="/static/icons/icon-192x192.png">
        <link rel="icon" sizes="512x512" href="/static/icons/icon-512x512.png">
        
        <!-- Styles -->
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
        <style>
          .gradient-bg {
            background: linear-gradient(135deg, #1E40AF 0%, #10B981 100%);
          }
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <!-- Logo -->
                    <div class="flex items-center space-x-3">
                        <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-14 w-auto">
                        <span class="text-xl font-bold text-gray-900">Amanah GO</span>
                    </div>
                    
                    <!-- Navigation Links (Center) -->
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#comment-ca-marche" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.how_it_works">Comment ça marche</a>
                        <a href="#securite" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.security">Sécurité</a>
                        <a href="#tarifs" class="text-gray-700 hover:text-blue-600 transition-colors font-medium" data-i18n="nav.pricing">Tarifs</a>
                        <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors font-bold flex items-center" data-i18n="nav.prohibited_items">
                            <i class="fas fa-ban mr-1"></i>Liste Noire
                        </a>
                    </div>
                    
                    <!-- Right Section: Language + Buttons -->
                    <div class="flex items-center space-x-5">
                        <!-- Language Switcher with balanced spacing -->
                        <div id="langSwitcher" class="px-4"></div>
                        
                        <!-- Auth Buttons -->
                        <button onclick="window.location.href='/login'" class="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <span data-i18n="common.login">Connexion</span>
                        </button>
                        <button onclick="window.location.href='/signup'" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            <span data-i18n="common.signup">Inscription</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="gradient-bg text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="text-5xl font-bold mb-6" data-i18n="landing.hero_title">
                    Voyagez Malin, Envoyez Futé
                </h1>
                <p class="text-xl mb-8 text-blue-100" data-i18n="landing.hero_subtitle">
                    La plateforme de confiance pour transporter vos colis entre la France et le Maroc
                </p>
                
                <!-- Double CTA -->
                <div class="flex flex-col md:flex-row justify-center gap-6 mb-12">
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/voyageur'">
                        <i class="fas fa-plane-departure text-blue-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2" data-i18n="landing.cta_traveler_title">Je voyage</h3>
                        <p class="text-gray-600 mb-4" data-i18n="landing.cta_traveler_desc">Rentabilisez votre voyage en transportant des colis</p>
                        <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-blue-700" data-i18n="landing.cta_traveler_button">
                            Publier mon voyage →
                        </button>
                    </div>
                    
                    <div class="bg-white text-gray-900 rounded-xl p-8 card-hover cursor-pointer flex-1 max-w-md" onclick="window.location.href='/expediteur'">
                        <i class="fas fa-box text-green-600 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold mb-2" data-i18n="landing.cta_sender_title">J'envoie un colis</h3>
                        <p class="text-gray-600 mb-4" data-i18n="landing.cta_sender_desc">Économisez jusqu'à 70% sur vos envois</p>
                        <button class="bg-green-600 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-green-700" data-i18n="landing.cta_sender_button">
                            Publier mon colis →
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div>
                        <div class="text-4xl font-bold">3.5M+</div>
                        <div class="text-blue-100" data-i18n="landing.stats_travelers">voyageurs/an</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">70%</div>
                        <div class="text-blue-100" data-i18n="landing.stats_savings">D'économies vs DHL</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold">100%</div>
                        <div class="text-blue-100" data-i18n="landing.stats_security">Paiement sécurisé</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Calculateur de Prix -->
        <section class="py-16 bg-white">
            <div class="max-w-4xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-8" data-i18n="landing.calculator_title">Calculez votre économie</h2>
                <div class="bg-gray-50 rounded-xl p-8 shadow-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="landing.calculator_weight_label">Poids du colis (kg)</label>
                            <input type="number" id="weight" value="10" min="1" max="50" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="landing.calculator_price_label">Prix par kg (€)</label>
                            <input type="number" id="pricePerKg" value="8" min="5" max="15" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                   onchange="calculatePrice()">
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="text-center border-r border-gray-200">
                                <div class="text-sm text-gray-600 mb-2" data-i18n="landing.calculator_amanah">Avec Amanah GO</div>
                                <div class="text-3xl font-bold text-green-600" id="amanahPrice">80 €</div>
                            </div>
                            <div class="text-center">
                                <div class="text-sm text-gray-600 mb-2" data-i18n="landing.calculator_dhl">DHL/Chronopost</div>
                                <div class="text-3xl font-bold text-gray-400" id="dhlPrice">280 €</div>
                                <div class="text-sm text-red-600 font-medium mt-2" id="savings">Vous économisez 200 € !</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Comment ça marche -->
        <section id="comment-ca-marche" class="py-16 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12" data-i18n="landing.how_it_works_title">Comment ça marche ?</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-blue-600">1</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step1_title">Créez votre annonce</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step1_desc">Voyageur : Publiez votre trajet. Expéditeur : Décrivez votre colis</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-green-600">2</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step2_title">Trouvez un match</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step2_desc">Notre système intelligent vous connecte avec des profils vérifiés</p>
                    </div>
                    
                    <div class="text-center">
                        <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-orange-600">3</span>
                        </div>
                        <h3 class="text-xl font-bold mb-2" data-i18n="landing.how_step3_title">Livraison sécurisée</h3>
                        <p class="text-gray-600" data-i18n="landing.how_step3_desc">Paiement bloqué jusqu'à confirmation de livraison</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Sécurité -->
        <section id="securite" class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12" data-i18n="landing.security_title">Votre sécurité, notre priorité</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-6">
                        <i class="fas fa-shield-alt text-blue-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_kyc_title">Vérification KYC</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_kyc_desc">Tous les utilisateurs vérifient leur identité</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-lock text-green-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_escrow_title">Paiement Escrow</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_escrow_desc">Fonds sécurisés jusqu'à livraison</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-star text-orange-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_rating_title">Système de notes</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_rating_desc">Avis vérifiés après chaque transaction</p>
                    </div>
                    
                    <div class="text-center p-6">
                        <i class="fas fa-ban text-red-600 text-4xl mb-4"></i>
                        <h3 class="font-bold mb-2" data-i18n="landing.security_blacklist_title">Liste noire</h3>
                        <p class="text-sm text-gray-600" data-i18n="landing.security_blacklist_desc">Produits interdits clairement affichés</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Final -->
        <section class="gradient-bg text-white py-16">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4" data-i18n="landing.cta_final_title">Prêt à commencer ?</h2>
                <p class="text-xl mb-8 text-blue-100" data-i18n="landing.cta_final_subtitle">Rejoignez des milliers d'utilisateurs qui font confiance à Amanah GO</p>
                <button onclick="window.location.href='/signup'" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100" data-i18n="landing.cta_final_button">
                    Créer mon compte gratuitement
                </button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <div class="flex justify-center space-x-6 mb-4">
                    <a href="#" class="hover:text-blue-400" data-i18n="landing.footer_about">À propos</a>
                    <a href="#" class="hover:text-blue-400" data-i18n="landing.footer_toc">CGU</a>
                    <a href="#" class="hover:text-blue-400" data-i18n="landing.footer_privacy">Confidentialité</a>
                    <a href="#" class="hover:text-blue-400" data-i18n="landing.footer_contact">Contact</a>
                </div>
                <p class="text-gray-400" data-i18n="landing.footer_copyright">© 2025 Amanah GO. Tous droits réservés.</p>
            </div>
        </footer>

        <script>
          function calculatePrice() {
            const weight = parseFloat(document.getElementById('weight').value) || 10;
            const pricePerKg = parseFloat(document.getElementById('pricePerKg').value) || 8;
            
            const amanahTotal = weight * pricePerKg;
            const dhlTotal = weight * 28; // Estimation DHL ~28€/kg
            const savings = dhlTotal - amanahTotal;
            
            document.getElementById('amanahPrice').textContent = Math.round(amanahTotal) + ' €';
            document.getElementById('dhlPrice').textContent = Math.round(dhlTotal) + ' €';
            
            // Use i18n for savings text
            const savingsText = window.t ? window.t('landing.calculator_savings').replace('{amount}', Math.round(savings)) : 'Vous économisez ' + Math.round(savings) + ' € !';
            document.getElementById('savings').textContent = savingsText;
          }
          
          // Initial calculation
          calculatePrice();
        <\/script>

        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        <\/script>
    </body>
    </html>
  `));g.get("/api/health",e=>e.json({status:"ok",message:"Amanah GO API is running",timestamp:new Date().toISOString()}));g.get("/api/users",async e=>{const{DB:t}=e.env;try{const{results:s}=await t.prepare("SELECT id, email, name, kyc_status, rating, reviews_count FROM users").all();return e.json({success:!0,users:s})}catch(s){return e.json({success:!1,error:s.message},500)}});g.get("/api/trips",async e=>{const{DB:t}=e.env;try{const{results:s}=await t.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.rating as traveler_rating,
        u.kyc_status
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'ACTIVE'
      ORDER BY t.departure_date ASC
    `).all();return e.json({success:!0,trips:s})}catch(s){return e.json({success:!1,error:s.message},500)}});g.get("/api/packages",async e=>{const{DB:t}=e.env;try{const{results:s}=await t.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.rating as shipper_rating,
        u.kyc_status
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC
    `).all();return e.json({success:!0,packages:s})}catch(s){return e.json({success:!1,error:s.message},500)}});g.get("/api/airports/search",async e=>{const{DB:t}=e.env,s=e.req.query("q")||"";if(s.length<2)return e.json({success:!0,airports:[]});try{const{results:a}=await t.prepare(`
      SELECT id, iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1
      AND (
        city LIKE ? 
        OR name LIKE ? 
        OR iata_code LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN city LIKE ? THEN 1
          WHEN iata_code LIKE ? THEN 2
          ELSE 3
        END,
        city ASC
      LIMIT 10
    `).bind(`%${s}%`,`%${s}%`,`${s.toUpperCase()}%`,`${s}%`,`${s.toUpperCase()}%`).all();return e.json({success:!0,airports:a})}catch(a){return e.json({success:!1,error:a.message},500)}});g.get("/api/airports/:iata",async e=>{const{DB:t}=e.env,s=e.req.param("iata").toUpperCase();try{const a=await t.prepare(`
      SELECT *
      FROM airports
      WHERE iata_code = ? AND active = 1
    `).bind(s).first();return a?e.json({success:!0,airport:a}):e.json({success:!1,error:"Aéroport non trouvé"},404)}catch(a){return e.json({success:!1,error:a.message},500)}});g.get("/api/airports",async e=>{const{DB:t}=e.env,s=e.req.query("country");try{let a="SELECT id, iata_code, name, city, country FROM airports WHERE active = 1",r=[];s&&(a+=" AND country = ?",r.push(s)),a+=" ORDER BY city ASC";const{results:i}=await t.prepare(a).bind(...r).all();return e.json({success:!0,airports:i})}catch(a){return e.json({success:!1,error:a.message},500)}});g.get("/api/flights/search",async e=>{const t=e.req.query("from"),s=e.req.query("to"),a=e.req.query("date");if(!t||!s||!a)return e.json({success:!1,error:"Paramètres requis: from, to, date (YYYY-MM-DD)"},400);const r=[{flight_number:"AT789",airline:"Air Arabia",airline_iata:"AT",departure:{airport:t,time:`${a}T08:30:00`,terminal:"2"},arrival:{airport:s,time:`${a}T11:45:00`,terminal:"1"},duration:"3h15",aircraft:"A320",status:"scheduled"},{flight_number:"RAM456",airline:"Royal Air Maroc",airline_iata:"AT",departure:{airport:t,time:`${a}T14:20:00`,terminal:"2"},arrival:{airport:s,time:`${a}T17:35:00`,terminal:"1"},duration:"3h15",aircraft:"B737",status:"scheduled"},{flight_number:"FR1234",airline:"Ryanair",airline_iata:"FR",departure:{airport:t,time:`${a}T19:10:00`,terminal:"3"},arrival:{airport:s,time:`${a}T22:25:00`,terminal:"1"},duration:"3h15",aircraft:"B737",status:"scheduled"}];return e.json({success:!0,flights:r,note:"Données simulées - AviationStack sera intégré en Phase 4"})});g.get("/api/flights/:flightNumber",async e=>{const s={flight_number:e.req.param("flightNumber").toUpperCase(),airline:"Royal Air Maroc",airline_iata:"AT",departure:{airport:"CDG",city:"Paris",time:"2025-12-25T14:20:00",terminal:"2"},arrival:{airport:"CMN",city:"Casablanca",time:"2025-12-25T17:35:00",terminal:"1"},duration:"3h15",aircraft:"B737",status:"scheduled"};return e.json({success:!0,flight:s,note:"Données simulées - AviationStack sera intégré en Phase 4"})});g.post("/api/auth/signup",async e=>{const{DB:t}=e.env;try{const{name:s,email:a,phone:r,password:i}=await e.req.json();if(!s||!a||!r||!i)return e.json({success:!1,error:"Tous les champs sont requis"},400);if(i.length<8)return e.json({success:!1,error:"Le mot de passe doit contenir au moins 8 caractères"},400);if(await t.prepare("SELECT id FROM users WHERE email = ?").bind(a).first())return e.json({success:!1,error:"Cet email est déjà utilisé"},400);const l=await Yt(i,10),o=crypto.randomUUID();await t.prepare(`
      INSERT INTO users (id, email, name, phone, password_hash, kyc_status, created_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', datetime('now'))
    `).bind(o,a,s,r,l).run();const c=e.env.JWT_SECRET||Ue,d=await Jt({id:o,email:a,name:s,exp:Math.floor(Date.now()/1e3)+3600*24*7},c);return e.json({success:!0,user:{id:o,email:a,name:s,phone:r,kyc_status:"PENDING"},token:d,message:"Compte créé avec succès"})}catch(s){return e.json({success:!1,error:s.message},500)}});g.post("/api/auth/send-verification-email",async e=>{try{return console.log("Envoi email de vérification..."),e.json({success:!0,message:"Email de vérification envoyé"})}catch(t){return e.json({success:!1,error:t.message},500)}});g.post("/api/auth/send-sms-verification",async e=>{const{DB:t}=e.env;try{const{phone:s,method:a="sms"}=await e.req.json();if(!s||s.length<10)return e.json({success:!1,error:"Numéro de téléphone invalide"},400);if(!["sms","whatsapp"].includes(a))return e.json({success:!1,error:'Méthode invalide. Utilisez "sms" ou "whatsapp"'},400);const r=Math.floor(1e5+Math.random()*9e5).toString(),i=e.env.TWILIO_ACCOUNT_SID,n=e.env.TWILIO_AUTH_TOKEN,l=e.env.TWILIO_PHONE_NUMBER,o=e.env.TWILIO_WHATSAPP_NUMBER||"whatsapp:+14155238886";if(!i||!n||!l)return console.log(`⚠️ Twilio non configuré. Code de vérification ${a.toUpperCase()} (DEV ONLY):`,r),e.json({success:!0,message:`${a==="whatsapp"?"WhatsApp":"SMS"} simulé - Twilio non configuré`,code:r,dev_mode:!0,method:a});const c=`Amanah GO - Votre code de vérification est : ${r}. Il expire dans 10 minutes.`;let d,u;a==="whatsapp"?(d=o,u=`whatsapp:${s}`):(d=l,u=s);try{const x=btoa(`${i}:${n}`),p=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${i}/Messages.json`,{method:"POST",headers:{Authorization:`Basic ${x}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({To:u,From:d,Body:c})});if(!p.ok){const m=await p.json();throw console.error(`Erreur Twilio ${a.toUpperCase()}:`,m),new Error(`Échec envoi ${a==="whatsapp"?"WhatsApp":"SMS"}`)}return console.log(`✅ ${a==="whatsapp"?"WhatsApp":"SMS"} envoyé avec succès à:`,s),e.json({success:!0,message:`${a==="whatsapp"?"Message WhatsApp":"SMS"} envoyé avec succès`,method:a})}catch(x){return console.error(`Erreur Twilio ${a.toUpperCase()}:`,x),e.json({success:!1,error:`Erreur lors de l'envoi du ${a==="whatsapp"?"message WhatsApp":"SMS"}`},500)}}catch(s){return e.json({success:!1,error:s.message},500)}});g.post("/api/auth/upload-kyc",async e=>{const{R2:t}=e.env;try{return e.json({success:!1,error:"Utilisez /api/auth/verify-kyc"},400)}catch(s){return e.json({success:!1,error:s.message},500)}});g.post("/api/auth/verify-kyc",async e=>{const{DB:t,R2:s,AI:a}=e.env;try{const r=await e.req.formData(),i=r.get("selfie"),n=r.get("id_document"),l=r.get("user_id");if(!i||!n||!l)return e.json({success:!1,error:"Selfie, pièce d'identité et user_id requis"},400);if(!await t.prepare("SELECT * FROM users WHERE id = ?").bind(l).first())return e.json({success:!1,error:"Utilisateur introuvable"},404);const c=`kyc/${l}/selfie-${Date.now()}.jpg`,d=await i.arrayBuffer();await s.put(c,d,{httpMetadata:{contentType:"image/jpeg"}});const u=`kyc/${l}/id-${Date.now()}.jpg`,x=await n.arrayBuffer();await s.put(u,x,{httpMetadata:{contentType:"image/jpeg"}});let p=!1,m=0;try{console.log("⚠️ Comparaison faciale non implémentée - Simulation OK"),p=!0,m=.85}catch(b){console.error("Erreur AI:",b)}const h=p?"VERIFIED":"PENDING_REVIEW";return await t.prepare(`
      UPDATE users 
      SET kyc_status = ?,
          kyc_selfie_url = ?,
          kyc_document_url = ?,
          kyc_verified_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(h,c,u,l).run(),e.json({success:!0,message:p?"Vérification KYC réussie ! Votre compte est maintenant vérifié.":"Documents reçus. Vérification manuelle en cours.",kyc_status:h,face_match:p,similarity:m})}catch(r){return console.error("Erreur KYC:",r),e.json({success:!1,error:r.message||"Erreur lors de la vérification KYC"},500)}});g.post("/api/auth/login",async e=>{const{DB:t}=e.env;try{const{email:s,password:a}=await e.req.json();if(!s||!a)return e.json({success:!1,error:"Email et mot de passe requis"},400);const r=await t.prepare("SELECT * FROM users WHERE email = ?").bind(s).first();if(!r)return e.json({success:!1,error:"Email ou mot de passe incorrect"},401);if(!await wa(a,r.password_hash))return e.json({success:!1,error:"Email ou mot de passe incorrect"},401);const n=e.env.JWT_SECRET||Ue,l=await Jt({id:r.id,email:r.email,name:r.name,exp:Math.floor(Date.now()/1e3)+3600*24*7},n);return e.json({success:!0,user:{id:r.id,email:r.email,name:r.name,phone:r.phone,kyc_status:r.kyc_status,rating:r.rating},token:l,message:"Connexion réussie"})}catch(s){return e.json({success:!1,error:s.message},500)}});g.get("/api/auth/me",$e,async e=>{const t=e.get("user");return e.json({success:!0,user:t})});g.post("/api/auth/verify-token",async e=>{try{const{token:t}=await e.req.json();if(!t)return e.json({valid:!1,error:"Token manquant"},400);const s=e.env.JWT_SECRET||Ue,a=await Kt(t,s);return!a||!a.id?e.json({valid:!1,error:"Token invalide"},401):e.json({valid:!0,user:{id:a.id,email:a.email,name:a.name}})}catch{return e.json({valid:!1,error:"Token invalide ou expiré"},401)}});g.get("/api/airports/search",async e=>{const{DB:t}=e.env,s=e.req.query("q")||"",a=e.req.query("country");try{let r=`
      SELECT iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1
        AND (
          name LIKE ? OR 
          city LIKE ? OR 
          iata_code LIKE ?
        )
    `;const i=`%${s}%`,n=[i,i,i];a&&(r+=" AND country = ?",n.push(a)),r+=" ORDER BY city ASC LIMIT 10";const{results:l}=await t.prepare(r).bind(...n).all();return e.json({success:!0,airports:l})}catch(r){return e.json({success:!1,error:r.message},500)}});g.get("/api/airports/country/:country",async e=>{const{DB:t}=e.env,s=e.req.param("country");try{const{results:a}=await t.prepare(`
      SELECT iata_code, name, city, country, latitude, longitude
      FROM airports
      WHERE active = 1 AND country = ?
      ORDER BY city ASC
    `).bind(s).all();return e.json({success:!0,airports:a})}catch(a){return e.json({success:!1,error:a.message},500)}});g.get("/api/airports/:iata",async e=>{const{DB:t}=e.env,s=e.req.param("iata").toUpperCase();try{const a=await t.prepare(`
      SELECT *
      FROM airports
      WHERE iata_code = ?
    `).bind(s).first();return a?e.json({success:!0,airport:a}):e.json({success:!1,error:"Aéroport non trouvé"},404)}catch(a){return e.json({success:!1,error:a.message},500)}});g.get("/api/flights/search",async e=>{const{DB:t}=e.env,s=e.req.query("from"),a=e.req.query("to"),r=e.req.query("date");try{const{results:i}=await t.prepare(`
      SELECT *
      FROM flight_cache
      WHERE departure_airport = ? 
        AND arrival_airport = ?
        AND date(departure_time) = date(?)
        AND expires_at > datetime('now')
      ORDER BY departure_time ASC
      LIMIT 20
    `).bind(s,a,r).all();return i.length===0?e.json({success:!0,flights:Ra(s,a,r),source:"mock"}):e.json({success:!0,flights:i,source:"cache"})}catch(i){return e.json({success:!1,error:i.message},500)}});g.get("/api/flights/:flightNumber",async e=>{const t=e.req.param("flightNumber");try{const s={flight_number:t,airline_name:"Royal Air Maroc",airline_iata:"AT",departure_airport:"CDG",departure_city:"Paris",arrival_airport:"CMN",arrival_city:"Casablanca",departure_time:new Date(Date.now()+864e5).toISOString(),arrival_time:new Date(Date.now()+972e5).toISOString(),flight_status:"scheduled",aircraft_type:"Boeing 737"};return e.json({success:!0,flight:s,source:"mock"})}catch(s){return e.json({success:!1,error:s.message},500)}});function Ra(e,t,s){const a=[{iata:"AT",name:"Royal Air Maroc"},{iata:"AF",name:"Air France"},{iata:"TO",name:"Transavia"},{iata:"FR",name:"Ryanair"}],r=[],i=new Date(s+"T00:00:00");for(let n=0;n<5;n++){const l=a[n%a.length],o=8+n*3,c=3.5,d=new Date(i);d.setHours(o);const u=new Date(d);u.setHours(u.getHours()+c),r.push({flight_number:`${l.iata}${1e3+n}`,airline_name:l.name,airline_iata:l.iata,departure_airport:e,arrival_airport:t,departure_time:d.toISOString(),arrival_time:u.toISOString(),flight_status:"scheduled",aircraft_type:"Boeing 737"})}return r}g.get("/login",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

        <div class="max-w-md mx-auto px-4 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
                <p class="text-gray-600 mb-8">Bienvenue sur Amanah GO</p>

                <form id="loginForm" class="space-y-6">
                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="exemple@email.com">
                    </div>

                    <!-- Mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                            <span>Mot de passe</span>
                            <a href="#" class="text-blue-600 hover:underline text-sm">Mot de passe oublié ?</a>
                        </label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Votre mot de passe">
                    </div>

                    <!-- Message d'erreur -->
                    <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <!-- Bouton connexion -->
                    <button type="submit"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Se connecter
                    </button>
                </form>

                <!-- Séparateur -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                </div>

                <!-- OAuth Buttons -->
                <div class="space-y-3">
                    <button onclick="alert('OAuth Google à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <button onclick="alert('OAuth Facebook à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-facebook text-blue-600 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Facebook</span>
                    </button>
                </div>

                <!-- Lien inscription -->
                <p class="mt-6 text-center text-sm text-gray-600">
                    Vous n'avez pas de compte ?
                    <a href="/signup" class="text-blue-600 hover:underline font-medium">Créer un compte</a>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
              const response = await axios.post('/api/auth/login', {
                email, password
              });
              
              if (response.data.success) {
                // Rediriger selon le statut KYC
                if (response.data.user.kyc_status === 'VERIFIED') {
                  window.location.href = '/dashboard';
                } else {
                  window.location.href = '/verify-profile?user_id=' + response.data.user.id;
                }
              }
            } catch (error) {
              showError(error.response?.data?.error || 'Email ou mot de passe incorrect');
            }
          });
          
          function showError(message) {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').textContent = message;
          }
        <\/script>
    </body>
    </html>
  `));g.get("/signup",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <a href="/" class="flex items-center space-x-2">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </a>
            </div>
        </nav>

        <div class="max-w-md mx-auto px-4 py-12">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                <p class="text-gray-600 mb-8">Rejoignez la communauté Amanah GO</p>

                <form id="signupForm" class="space-y-6">
                    <!-- Nom complet -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="name" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Ex: Mohammed Alami">
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email <span class="text-red-500">*</span>
                        </label>
                        <input type="email" id="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="exemple@email.com">
                    </div>

                    <!-- Téléphone -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" id="phone" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="+33 6 12 34 56 78">
                    </div>

                    <!-- Mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe <span class="text-red-500">*</span>
                        </label>
                        <input type="password" id="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Minimum 8 caractères">
                    </div>

                    <!-- Confirmer mot de passe -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le mot de passe <span class="text-red-500">*</span>
                        </label>
                        <input type="password" id="confirmPassword" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                               placeholder="Retapez votre mot de passe">
                    </div>

                    <!-- CGU -->
                    <div class="flex items-start">
                        <input type="checkbox" id="terms" required
                               class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="terms" class="ml-2 text-sm text-gray-600">
                            J'accepte les <a href="#" class="text-blue-600 hover:underline">Conditions Générales d'Utilisation</a>
                            et la <a href="#" class="text-blue-600 hover:underline">Politique de Confidentialité</a>
                        </label>
                    </div>

                    <!-- Message d'erreur -->
                    <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="errorText"></span>
                    </div>

                    <!-- Bouton inscription -->
                    <button type="submit"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">
                        <i class="fas fa-user-plus mr-2"></i>
                        Créer mon compte
                    </button>
                </form>

                <!-- Séparateur -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                </div>

                <!-- OAuth Buttons -->
                <div class="space-y-3">
                    <button onclick="alert('OAuth Google à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-google text-red-500 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Google</span>
                    </button>
                    
                    <button onclick="alert('OAuth Facebook à implémenter')"
                            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i class="fab fa-facebook text-blue-600 mr-2"></i>
                        <span class="font-medium text-gray-700">Continuer avec Facebook</span>
                    </button>
                </div>

                <!-- Lien connexion -->
                <p class="mt-6 text-center text-sm text-gray-600">
                    Vous avez déjà un compte ?
                    <a href="/login" class="text-blue-600 hover:underline font-medium">Se connecter</a>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (password !== confirmPassword) {
              showError('Les mots de passe ne correspondent pas');
              return;
            }
            
            if (password.length < 8) {
              showError('Le mot de passe doit contenir au moins 8 caractères');
              return;
            }
            
            try {
              const response = await axios.post('/api/auth/signup', {
                name, email, phone, password
              });
              
              if (response.data.success) {
                // Rediriger vers la page de vérification
                window.location.href = '/verify-profile?user_id=' + response.data.user_id;
              }
            } catch (error) {
              showError(error.response?.data?.error || 'Erreur lors de l\\'inscription');
            }
          });
          
          function showError(message) {
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('errorText').textContent = message;
          }
        <\/script>
    </body>
    </html>
  `));g.get("/voyageur",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Espace Voyageur - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName">Utilisateur</span>
                    </span>
                    <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors font-bold" title="Produits interdits">
                        <i class="fas fa-ban mr-2"></i><span data-i18n="nav.prohibited_items">Liste Noire</span>
                    </a>
                    <a href="/" class="text-blue-600 hover:text-blue-700 transition-colors">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Welcome Banner -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-plane-departure mr-3"></i>
                            <span data-i18n="traveler.welcome">Bienvenue dans votre Espace Voyageur</span>
                        </h1>
                        <p class="text-blue-100 text-lg" data-i18n="traveler.welcome_subtitle">Monétisez vos trajets France ↔ Maroc en transportant des colis</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-suitcase-rolling text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <a href="/voyageur/publier-trajet" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-plus text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="traveler.publish_trip">Publier un Trajet</h3>
                    <p class="text-gray-600" data-i18n="traveler.publish_trip_desc">Ajoutez un nouveau trajet et commencez à gagner de l'argent</p>
                </a>

                <a href="/voyageur/mes-trajets" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-4 group-hover:bg-green-600 transition-colors">
                            <i class="fas fa-list text-2xl text-green-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="traveler.my_trips">Mes Trajets</h3>
                    <p class="text-gray-600" data-i18n="traveler.my_trips_desc">Consultez et gérez tous vos trajets publiés</p>
                </a>

                <a href="/verify-profile" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-shield-alt text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="nav.verify_profile">Vérifier mon Profil</h3>
                    <p class="text-gray-600" data-i18n="traveler.verify_profile_desc">Complétez votre KYC pour débloquer toutes les fonctionnalités</p>
                </a>
            </div>

            <!-- Stats Overview -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                    <span data-i18n="traveler.quick_overview">Aperçu Rapide</span>
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-route text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statTrips">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_trips">Trajets publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statActive">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_active">Trajets actifs</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statWeight">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_weight">kg disponibles</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-euro-sign text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-green-600" id="statEarnings">0</p>
                        <p class="text-sm text-gray-600" data-i18n="traveler.stats_earnings">Gains potentiels</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    <span data-i18n="landing.how_it_works_title">Comment ça marche ?</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step1">Publiez votre trajet</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step1_desc">Indiquez votre itinéraire, dates et poids disponible</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step2">Recevez des propositions</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step2_desc">Les expéditeurs vous contactent avec leurs demandes</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="traveler.how_step3">Gagnez de l'argent</h3>
                        <p class="text-gray-600 text-sm" data-i18n="traveler.how_step3_desc">Transportez et recevez votre paiement sécurisé</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          // Load user stats
          async function loadStats() {
            try {
              // TODO: Replace with real user ID from session/JWT
              const userId = localStorage.getItem('userId') || 1
              
              const response = await axios.get(\`/api/trips?user_id=\${userId}\`)
              
              if (response.data.success) {
                const trips = response.data.trips || []
                const activeTrips = trips.filter(t => t.status === 'ACTIVE')
                const totalWeight = activeTrips.reduce((sum, t) => sum + (t.available_weight || 0), 0)
                const totalEarnings = activeTrips.reduce((sum, t) => sum + (t.estimated_earnings || 0), 0)
                
                document.getElementById('statTrips').textContent = trips.length
                document.getElementById('statActive').textContent = activeTrips.length
                document.getElementById('statWeight').textContent = totalWeight
                document.getElementById('statEarnings').textContent = totalEarnings.toFixed(2) + '€'
              }
            } catch (error) {
              console.error('Erreur chargement stats:', error)
            }
          }
          
          // Load user name
          const userName = localStorage.getItem('userName')
          if (userName) {
            document.getElementById('userName').textContent = userName
          }
          
          loadStats()
        <\/script>

        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        <\/script>
    </body>
    </html>
  `));g.get("/verify-profile",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification du Profil - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .verification-card {
            transition: all 0.3s ease;
          }
          .verification-card.completed {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-color: #10B981;
          }
          .verification-card.completed * {
            color: white !important;
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 min-h-screen">
        <!-- Header -->
        <nav class="bg-blue-900/50 backdrop-blur-sm border-b border-blue-700">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-white">Amanah GO</span>
                </div>
                <a href="/" class="text-white hover:text-blue-200">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Retour à l'accueil
                </a>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 py-12">
            <!-- Titre -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-white mb-4">Vérification du Profil</h1>
                <p class="text-blue-200 text-lg">
                    Complétez ces étapes pour débloquer toutes les fonctionnalités et renforcer la confiance au sein de la communauté.
                </p>
            </div>

            <!-- Statut de la vérification -->
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
                <h2 class="text-2xl font-bold text-white mb-6">Statut de la vérification</h2>
                
                <div class="space-y-4">
                    <!-- Vérifier l'E-mail -->
                    <div id="emailCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="bg-blue-500/20 p-4 rounded-full">
                                <i class="fas fa-envelope text-blue-300 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Vérifier l'E-mail</h3>
                                <p class="text-blue-200 text-sm">Confirmez votre adresse e-mail pour sécuriser votre compte.</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="verifyEmail()" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition">
                                Vérifier maintenant
                            </button>
                        </div>
                    </div>

                    <!-- Vérifier le Téléphone -->
                    <div id="phoneCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 flex items-center justify-between opacity-50">
                        <div class="flex items-center space-x-4">
                            <div class="bg-blue-500/20 p-4 rounded-full">
                                <i class="fas fa-phone text-blue-300 text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Vérifier le Téléphone</h3>
                                <p class="text-blue-200 text-sm">Validez par SMS ou WhatsApp pour sécuriser votre compte.</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-medium text-sm">
                                Requis
                            </span>
                            <button onclick="openPhoneModal()" disabled
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Vérifier maintenant
                            </button>
                        </div>
                    </div>

                    <!-- Pièce d'Identité & Vérification Faciale -->
                    <div id="kycCard" class="verification-card bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 opacity-50">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center space-x-4">
                                <div class="bg-blue-500/20 p-4 rounded-full">
                                    <i class="fas fa-id-card text-blue-300 text-2xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-white">Pièce d'Identité & Vérification Faciale</h3>
                                    <p class="text-blue-200 text-sm">Confirmez votre identité pour augmenter la confiance.</p>
                                </div>
                            </div>
                            <span class="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-medium text-sm">
                                Requis
                            </span>
                        </div>

                        <!-- Étapes KYC -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <!-- Étape 1: Selfie -->
                            <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h4 class="text-white font-bold mb-3 flex items-center">
                                    <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                                    Étape 1: Prendre un Selfie en Direct
                                </h4>
                                <p class="text-blue-200 text-xs mb-4">
                                    🔒 Capture en direct obligatoire pour prévenir la fraude
                                </p>
                                
                                <!-- Zone de capture vidéo/preview -->
                                <div class="border-2 border-dashed border-white/20 rounded-lg overflow-hidden mb-4 bg-black/30">
                                    <video id="selfieVideo" class="w-full hidden" autoplay playsinline></video>
                                    <canvas id="selfieCanvas" class="hidden"></canvas>
                                    <img id="selfiePreview" class="w-full hidden" alt="Selfie preview">
                                    
                                    <div id="selfiePreviewEmpty" class="p-8 text-center">
                                        <i class="fas fa-camera text-blue-300 text-4xl mb-3"></i>
                                        <p class="text-blue-200 text-sm">Prenez une photo de votre visage</p>
                                        <p class="text-blue-300 text-xs mt-2">Photo claire, bien éclairée</p>
                                    </div>
                                </div>
                                
                                <!-- Boutons de contrôle -->
                                <button onclick="startSelfieCapture()" disabled id="startSelfieBtn"
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed mb-2">
                                    <i class="fas fa-camera mr-2"></i>
                                    Démarrer la caméra
                                </button>
                                
                                <button onclick="captureSelfie()" id="captureSelfieBtn" class="hidden w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition mb-2">
                                    <i class="fas fa-camera mr-2"></i>
                                    Capturer
                                </button>
                                
                                <button onclick="retakeSelfie()" id="retakeSelfieBtn" class="hidden w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                    <i class="fas fa-redo mr-2"></i>
                                    Reprendre
                                </button>
                                
                                <div class="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p class="text-yellow-200 text-xs">
                                        <i class="fas fa-info-circle mr-2"></i>
                                        <strong>Important :</strong> La capture en direct est obligatoire pour prévenir la fraude. Si l'accès caméra ne fonctionne pas, vérifiez que vous utilisez HTTPS.
                                    </p>
                                </div>
                            </div>

                            <!-- Étape 2: Pièce d'identité -->
                            <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                                <h4 class="text-white font-bold mb-3">Étape 2: Télécharger la Pièce d'Identité</h4>
                                
                                <!-- Zone d'upload/preview -->
                                <div class="border-2 border-dashed border-white/20 rounded-lg overflow-hidden mb-4 bg-black/30">
                                    <img id="idPreview" class="w-full hidden" alt="ID preview">
                                    
                                    <div id="idPreviewEmpty" class="p-8 text-center">
                                        <i class="fas fa-upload text-blue-300 text-4xl mb-3"></i>
                                        <p class="text-blue-200 text-sm">CIN, Passeport ou Permis</p>
                                        <p class="text-blue-300 text-xs mt-2">Photo recto de votre pièce</p>
                                    </div>
                                </div>
                                
                                <p id="idFileName" class="text-blue-200 text-sm mb-2 hidden truncate"></p>
                                
                                <button onclick="uploadIDDocument()" disabled id="uploadIDBtn"
                                        class="w-full bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium transition cursor-not-allowed">
                                    <i class="fas fa-file-upload mr-2"></i>
                                    Cliquez pour télécharger
                                </button>
                            </div>
                        </div>
                        
                        <!-- Bouton de soumission -->
                        <div class="mt-6">
                            <button onclick="submitKYCVerification()" id="submitKYCBtn" disabled
                                    class="w-full bg-green-500/20 text-green-300 px-6 py-3 rounded-lg font-bold text-lg transition cursor-not-allowed">
                                <i class="fas fa-check mr-2"></i>
                                Soumettre la vérification
                            </button>
                            <p class="text-blue-200 text-sm text-center mt-2">
                                Les deux documents sont requis pour continuer
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bénéfices de la vérification -->
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                    Pourquoi vérifier mon profil ?
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <i class="fas fa-check-circle text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Badge vérifié</p>
                        <p class="text-blue-200 text-sm">Augmentez votre crédibilité</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-lock text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Transactions sécurisées</p>
                        <p class="text-blue-200 text-sm">Protection renforcée</p>
                    </div>
                    <div class="text-center">
                        <i class="fas fa-star text-green-400 text-3xl mb-2"></i>
                        <p class="text-white font-medium">Priorité de matching</p>
                        <p class="text-blue-200 text-sm">Plus de propositions</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de vérification téléphone -->
        <div id="phoneModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-900">Vérification du téléphone</h3>
                    <button onclick="closePhoneModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Étape 1: Entrer le numéro -->
                <div id="phoneStep1" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de téléphone <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" id="phoneInput" 
                               placeholder="+33 6 12 34 56 78"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="text-sm text-gray-500 mt-1">Format international (ex: +33612345678)</p>
                    </div>

                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-3">Choisissez votre méthode de vérification:</p>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="sendVerificationCode('sms')" 
                                    class="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                                <i class="fas fa-sms text-3xl text-gray-400 group-hover:text-blue-600 mb-2"></i>
                                <span class="font-semibold text-gray-700 group-hover:text-blue-600">SMS</span>
                                <span class="text-xs text-gray-500 mt-1">Classique</span>
                            </button>
                            
                            <button onclick="sendVerificationCode('whatsapp')" 
                                    class="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition group">
                                <i class="fab fa-whatsapp text-3xl text-gray-400 group-hover:text-green-600 mb-2"></i>
                                <span class="font-semibold text-gray-700 group-hover:text-green-600">WhatsApp</span>
                                <span class="text-xs text-gray-500 mt-1">Rapide</span>
                            </button>
                        </div>
                    </div>

                    <div id="phoneError" class="hidden bg-red-50 border border-red-200 rounded-lg p-3">
                        <p class="text-red-600 text-sm"></p>
                    </div>
                </div>

                <!-- Étape 2: Entrer le code -->
                <div id="phoneStep2" class="hidden space-y-6">
                    <div class="text-center mb-4">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                            <i id="methodIcon" class="fas fa-sms text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-gray-600">
                            Code envoyé par <span id="methodText" class="font-semibold">SMS</span> au
                            <br><span id="phoneDisplay" class="font-mono text-lg"></span>
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Entrez le code à 6 chiffres
                        </label>
                        <input type="text" id="codeInput" 
                               maxlength="6"
                               placeholder="000000"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <!-- Affichage du code en mode dev -->
                    <div id="devCodeDisplay" class="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p class="text-yellow-800 text-sm">
                            <i class="fas fa-code mr-2"></i>
                            <strong>Mode DEV:</strong> Votre code est <span id="devCode" class="font-mono text-lg"></span>
                        </p>
                    </div>

                    <div class="flex space-x-3">
                        <button onclick="showStep1()" 
                                class="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">
                            <i class="fas fa-arrow-left mr-2"></i>Retour
                        </button>
                        <button onclick="verifyCode()" 
                                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                            Vérifier<i class="fas fa-check ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/kyc-verification.js"><\/script>
        <script>
          let verificationState = {
            email: false,
            phone: false,
            kyc: false
          };

          let currentPhone = '';
          let currentMethod = '';

          async function verifyEmail() {
            // Simuler envoi email de vérification
            const confirmed = confirm('Un email de vérification va être envoyé. Continuer ?');
            if (confirmed) {
              try {
                await axios.post('/api/auth/send-verification-email');
                alert('Email de vérification envoyé ! Vérifiez votre boîte de réception.');
                
                // Marquer comme vérifié (simulation)
                verificationState.email = true;
                updateUI();
              } catch (error) {
                alert('Erreur lors de l\\'envoi de l\\'email');
              }
            }
          }

          function openPhoneModal() {
            document.getElementById('phoneModal').classList.remove('hidden');
            document.getElementById('phoneModal').classList.add('flex');
          }

          function closePhoneModal() {
            document.getElementById('phoneModal').classList.add('hidden');
            document.getElementById('phoneModal').classList.remove('flex');
            showStep1();
          }

          function showStep1() {
            document.getElementById('phoneStep1').classList.remove('hidden');
            document.getElementById('phoneStep2').classList.add('hidden');
            document.getElementById('phoneError').classList.add('hidden');
          }

          function showStep2() {
            document.getElementById('phoneStep1').classList.add('hidden');
            document.getElementById('phoneStep2').classList.remove('hidden');
          }

          function showError(message) {
            const errorDiv = document.getElementById('phoneError');
            errorDiv.querySelector('p').textContent = message;
            errorDiv.classList.remove('hidden');
          }

          async function sendVerificationCode(method) {
            const phoneInput = document.getElementById('phoneInput');
            const phone = phoneInput.value.trim();

            if (!phone || phone.length < 10) {
              showError('Veuillez entrer un numéro de téléphone valide (format international)');
              return;
            }

            currentPhone = phone;
            currentMethod = method;

            try {
              const response = await axios.post('/api/auth/send-sms-verification', { 
                phone: phone,
                method: method 
              });

              // Afficher le code en mode dev
              if (response.data.dev_mode && response.data.code) {
                document.getElementById('devCode').textContent = response.data.code;
                document.getElementById('devCodeDisplay').classList.remove('hidden');
              }

              // Mettre à jour l'affichage
              document.getElementById('phoneDisplay').textContent = phone;
              document.getElementById('methodText').textContent = method === 'whatsapp' ? 'WhatsApp' : 'SMS';
              document.getElementById('methodIcon').className = method === 'whatsapp' 
                ? 'fab fa-whatsapp text-2xl text-green-600'
                : 'fas fa-sms text-2xl text-blue-600';

              showStep2();

            } catch (error) {
              const errorMsg = error.response?.data?.error || error.message;
              showError('Erreur: ' + errorMsg);
            }
          }

          async function verifyCode() {
            const code = document.getElementById('codeInput').value.trim();
            
            if (!code || code.length !== 6) {
              alert('Veuillez entrer un code à 6 chiffres');
              return;
            }

            // TODO: Appeler l'API pour vérifier le code
            // Pour l'instant, simulation
            verificationState.phone = true;
            updateUI();
            closePhoneModal();
            alert('✅ Téléphone vérifié avec succès !');
          }

          function startSelfieCapture() {
            alert('Fonction caméra selfie à implémenter avec Web Camera API');
          }

          function uploadIDDocument() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
              const file = e.target.files[0];
              if (file) {
                alert('Upload de ' + file.name + ' (à implémenter avec Cloudflare R2)');
                // TODO: Upload vers R2 et analyse avec AI
              }
            };
            input.click();
          }

          function updateUI() {
            // Email vérifié
            if (verificationState.email) {
              const emailCard = document.getElementById('emailCard');
              emailCard.classList.add('completed');
              emailCard.querySelector('button').textContent = 'Vérifié ✓';
              emailCard.querySelector('button').disabled = true;
              
              // Déverrouiller téléphone
              const phoneCard = document.getElementById('phoneCard');
              phoneCard.classList.remove('opacity-50');
              phoneCard.querySelector('button').disabled = false;
            }

            // Téléphone vérifié
            if (verificationState.phone) {
              const phoneCard = document.getElementById('phoneCard');
              phoneCard.classList.add('completed');
              phoneCard.querySelector('button').textContent = 'Vérifié ✓';
              phoneCard.querySelector('button').disabled = true;
              
              // Déverrouiller KYC
              const kycCard = document.getElementById('kycCard');
              kycCard.classList.remove('opacity-50');
              
              // Activer les boutons KYC
              document.getElementById('startSelfieBtn').disabled = false;
              document.getElementById('startSelfieBtn').classList.remove('bg-blue-500/20', 'text-blue-300', 'cursor-not-allowed');
              document.getElementById('startSelfieBtn').classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
              
              document.getElementById('uploadIDBtn').disabled = false;
              document.getElementById('uploadIDBtn').classList.remove('bg-blue-500/20', 'text-blue-300', 'cursor-not-allowed');
              document.getElementById('uploadIDBtn').classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'cursor-pointer');
            }
          }
        <\/script>
    </body>
    </html>
  `));g.get("/expediteur",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Espace Expéditeur - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcher"></div>
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName">Utilisateur</span>
                    </span>
                    <a href="/prohibited-items" class="text-red-600 hover:text-red-700 transition-colors font-bold" title="Produits interdits">
                        <i class="fas fa-ban mr-2"></i><span data-i18n="nav.prohibited_items">Liste Noire</span>
                    </a>
                    <a href="/" class="text-green-600 hover:text-green-700 transition-colors">
                        <i class="fas fa-home mr-2"></i><span data-i18n="common.home">Accueil</span>
                    </a>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-8">
            <!-- Welcome Banner -->
            <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-box mr-3"></i>
                            <span data-i18n="sender.welcome">Bienvenue dans votre Espace Expéditeur</span>
                        </h1>
                        <p class="text-green-100 text-lg" data-i18n="sender.welcome_subtitle">Économisez jusqu'à 70% sur vos envois France ↔ Maroc</p>
                    </div>
                    <div class="hidden md:block">
                        <i class="fas fa-shipping-fast text-6xl opacity-20"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <a href="/expediteur/publier-colis" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-green-100 rounded-full p-4 group-hover:bg-green-600 transition-colors">
                            <i class="fas fa-plus text-2xl text-green-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.publish_package">Publier un Colis</h3>
                    <p class="text-gray-600" data-i18n="sender.publish_package_desc">Créez une nouvelle demande d'envoi de colis</p>
                </a>

                <a href="/expediteur/mes-colis" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-blue-100 rounded-full p-4 group-hover:bg-blue-600 transition-colors">
                            <i class="fas fa-list text-2xl text-blue-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.my_packages">Mes Colis</h3>
                    <p class="text-gray-600" data-i18n="sender.my_packages_desc">Suivez tous vos envois en cours et passés</p>
                </a>

                <div onclick="searchTrips()" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="bg-purple-100 rounded-full p-4 group-hover:bg-purple-600 transition-colors">
                            <i class="fas fa-search text-2xl text-purple-600 group-hover:text-white"></i>
                        </div>
                        <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-600 transition-colors"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2" data-i18n="sender.search_trip">Rechercher un Trajet</h3>
                    <p class="text-gray-600" data-i18n="sender.search_trip_desc">Trouvez un voyageur pour transporter votre colis</p>
                </div>
            </div>

            <!-- Search Section -->
            <div id="searchSection" class="bg-white rounded-xl shadow-lg p-8 mb-8 hidden">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-search text-green-600 mr-2"></i>
                    <span data-i18n="sender.search_title">Rechercher un Trajet Disponible</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <input type="text" id="searchOrigin" placeholder="Ville de départ" data-i18n-placeholder="sender.search_origin" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <input type="text" id="searchDestination" placeholder="Ville d'arrivée" data-i18n-placeholder="sender.search_destination" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <button onclick="performSearch()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                        <i class="fas fa-search mr-2"></i><span data-i18n="sender.search_button">Rechercher</span>
                    </button>
                </div>
                <div id="searchResults" class="space-y-4">
                    <!-- Results will be displayed here -->
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-chart-line text-green-600 mr-2"></i>
                    <span data-i18n="traveler.quick_overview">Aperçu Rapide</span>
                </h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-box text-2xl text-green-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPackages">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_packages">Colis publiés</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-clock text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statPending">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_pending">En attente</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-shipping-fast text-2xl text-yellow-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statInTransit">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_in_transit">En transit</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-check-circle text-2xl text-purple-600"></i>
                        </div>
                        <p class="text-3xl font-bold text-gray-900" id="statDelivered">0</p>
                        <p class="text-sm text-gray-600" data-i18n="sender.stats_delivered">Livrés</p>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    <span data-i18n="landing.how_it_works_title">Comment ça marche ?</span>
                </h2>
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step1">Publiez votre colis</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step1_desc">Décrivez votre envoi, destination et budget</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step2">Trouvez un voyageur</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step2_desc">Des voyageurs vous contactent ou recherchez-en un</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                        <h3 class="font-semibold text-gray-900 mb-2" data-i18n="sender.how_step3">Économisez de l'argent</h3>
                        <p class="text-gray-600 text-sm" data-i18n="sender.how_step3_desc">Recevez votre colis jusqu'à 70% moins cher</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          // Toggle search section
          function searchTrips() {
            const section = document.getElementById('searchSection')
            section.classList.toggle('hidden')
            if (!section.classList.contains('hidden')) {
              document.getElementById('searchOrigin').focus()
            }
          }

          // Perform trip search
          async function performSearch() {
            const origin = document.getElementById('searchOrigin').value.trim()
            const destination = document.getElementById('searchDestination').value.trim()
            
            if (!origin || !destination) {
              alert('Veuillez remplir les villes de départ et d\\'arrivée')
              return
            }
            
            try {
              const response = await axios.get(\`/api/trips?origin=\${encodeURIComponent(origin)}&destination=\${encodeURIComponent(destination)}&status=ACTIVE\`)
              
              const resultsDiv = document.getElementById('searchResults')
              
              if (response.data.success && response.data.trips.length > 0) {
                resultsDiv.innerHTML = response.data.trips.map(trip => \`
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-semibold text-gray-900">\${trip.origin_city} → \${trip.destination_city}</h3>
                        <p class="text-sm text-gray-600">Départ: \${new Date(trip.departure_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">\${trip.available_weight}kg</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <p class="text-lg font-bold text-green-600">\${trip.price_per_kg}€/kg</p>
                      <button onclick="contactTraveler(\${trip.id})" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <i class="fas fa-envelope mr-1"></i>Contacter
                      </button>
                    </div>
                  </div>
                \`).join('')
              } else {
                resultsDiv.innerHTML = \`
                  <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p>Aucun trajet disponible pour cette recherche</p>
                  </div>
                \`
              }
            } catch (error) {
              console.error('Erreur recherche:', error)
              alert('Erreur lors de la recherche')
            }
          }

          // Contact traveler (placeholder)
          function contactTraveler(tripId) {
            alert(\`Fonctionnalité de contact en cours de développement (Trajet #\${tripId})\`)
            // TODO: Implement real-time chat or messaging system
          }

          // Load user stats
          async function loadStats() {
            try {
              // TODO: Replace with real user ID from session/JWT
              const userId = localStorage.getItem('userId') || 1
              
              const response = await axios.get(\`/api/packages?user_id=\${userId}\`)
              
              if (response.data.success) {
                const packages = response.data.packages || []
                document.getElementById('statPackages').textContent = packages.length
                document.getElementById('statPending').textContent = packages.filter(p => p.status === 'PUBLISHED').length
                document.getElementById('statInTransit').textContent = packages.filter(p => p.status === 'IN_TRANSIT').length
                document.getElementById('statDelivered').textContent = packages.filter(p => p.status === 'DELIVERED').length
              }
            } catch (error) {
              console.error('Erreur chargement stats:', error)
            }
          }
          
          // Load user name
          const userName = localStorage.getItem('userName')
          if (userName) {
            document.getElementById('userName').textContent = userName
          }
          
          loadStats()
        <\/script>

        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
          // Initialize i18n and inject language switcher
          window.addEventListener('DOMContentLoaded', async () => {
            await window.i18n.init()
            document.getElementById('langSwitcher').innerHTML = createLanguageSwitcher()
            
            // Apply translations
            document.querySelectorAll('[data-i18n]').forEach(el => {
              const key = el.getAttribute('data-i18n')
              el.textContent = window.t(key)
            })
            
            // Recalculate price after translations loaded (Landing page only)
            if (typeof calculatePrice === 'function') {
              calculatePrice()
            }
          })
        <\/script>
    </body>
    </html>
  `));g.get("/voyageur/publier-trajet",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Publier un Trajet - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName"></span>
                    </span>
                    <a href="/voyageur" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-suitcase-rolling text-blue-600 mr-3"></i>
                    Publier un Trajet
                </h1>
                <p class="text-gray-600 mb-8">Partagez votre espace bagage et gagnez de l'argent</p>

                <form onsubmit="submitTrip(event)" id="tripForm">
                    <!-- Itinéraire -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-route text-blue-600 mr-2"></i>
                            Itinéraire
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <!-- Départ -->
                            <div class="airport-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville de départ <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-plane-departure absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="departureCity"
                                        placeholder="Ex: Paris"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input type="hidden" id="departureAirportCode" />
                                </div>
                                <div id="departureSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>

                            <!-- Arrivée -->
                            <div class="airport-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville d'arrivée <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-plane-arrival absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="arrivalCity"
                                        placeholder="Ex: Casablanca"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <input type="hidden" id="arrivalAirportCode" />
                                </div>
                                <div id="arrivalSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>
                        </div>

                        <!-- Date de départ -->
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Date et heure de départ <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                id="departureDate"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <!-- Flight Number (Optional) -->
                        <div id="flightNumberSection" class="mt-6 hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de vol (optionnel)
                            </label>
                            <div class="flex gap-2">
                                <input 
                                    type="text" 
                                    id="flightNumber"
                                    placeholder="Ex: AT800"
                                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                />
                                <button 
                                    type="button"
                                    id="importFlight"
                                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    <i class="fas fa-plane mr-2"></i>Importer
                                </button>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">Importez automatiquement les détails du vol</p>
                        </div>

                        <!-- Dates flexibles -->
                        <div class="mt-4">
                            <label class="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="flexibleDates"
                                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span class="ml-3 text-gray-700">Dates flexibles (±2 jours)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Capacité & Prix -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-box text-blue-600 mr-2"></i>
                            Capacité & Tarifs
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Poids disponible (kg) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="availableWeight"
                                    placeholder="Ex: 15"
                                    min="1"
                                    max="30"
                                    step="0.5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p class="text-sm text-gray-500 mt-1">Maximum 30 kg</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Prix par kg (€) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="pricePerKg"
                                    placeholder="Ex: 8"
                                    min="5"
                                    max="20"
                                    step="0.5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p class="text-sm text-gray-500 mt-1">Prix recommandé: 7-10€/kg</p>
                            </div>
                        </div>

                        <!-- Earnings Calculator -->
                        <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Gains estimés (après commission 12%)</p>
                                    <p class="text-3xl font-bold text-green-600">
                                        <span id="totalEarnings">0.00</span> €
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">Commission plateforme: <span id="commission">0.00</span> €</p>
                                </div>
                                <i class="fas fa-euro-sign text-4xl text-green-300"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                            Informations complémentaires
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Description (optionnel)
                        </label>
                        <textarea 
                            id="description"
                            rows="4"
                            placeholder="Ajoutez des détails sur votre trajet, vos conditions de transport..."
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        ></textarea>
                    </div>

                    <!-- Submit -->
                    <div class="flex justify-end gap-4">
                        <a href="/voyageur" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Annuler
                        </a>
                        <button 
                            type="submit"
                            id="submitBtn"
                            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            Publier mon trajet
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/publish-trip.js"><\/script>
    </body>
    </html>
  `));g.get("/expediteur/publier-colis",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Publier un Colis - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span id="userName"></span>
                    </span>
                    <a href="/expediteur" class="text-blue-600 hover:text-blue-700">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    <i class="fas fa-box text-blue-600 mr-3"></i>
                    Publier un Colis
                </h1>
                <p class="text-gray-600 mb-8">Trouvez un voyageur pour transporter votre colis</p>

                <form onsubmit="submitPackage(event)" id="packageForm">
                    <!-- Titre & Description -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-tag text-blue-600 mr-2"></i>
                            Description du colis
                        </h2>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Titre <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="title"
                                placeholder="Ex: Cadeaux pour famille"
                                maxlength="100"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Description (optionnel)
                            </label>
                            <textarea 
                                id="description"
                                rows="3"
                                placeholder="Détails sur le contenu..."
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ></textarea>
                        </div>
                    </div>

                    <!-- Contenu -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
                            Déclaration du contenu
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Déclaration précise du contenu <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="contentDeclaration"
                            rows="3"
                            placeholder="Ex: Vêtements, jouets, produits alimentaires non périssables"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        ></textarea>
                        <p class="text-sm text-red-600 mt-2">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Important: Déclarez précisément le contenu. Les produits interdits (alcool, médicaments, contrefaçons) sont strictement prohibés.
                        </p>
                    </div>

                    <!-- Photos -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-camera text-blue-600 mr-2"></i>
                            Photos du colis (recommandé)
                        </h2>

                        <div class="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4" id="photosPreview">
                            <!-- Photos will be inserted here -->
                        </div>

                        <button 
                            type="button"
                            id="uploadPhotoBtn"
                            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <i class="fas fa-plus-circle mr-2"></i>
                            Ajouter des photos (max 5)
                        </button>
                        <input type="file" id="photoInput" accept="image/*" multiple class="hidden" />
                    </div>

                    <!-- Dimensions & Poids -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-weight-hanging text-blue-600 mr-2"></i>
                            Dimensions & Poids
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Poids (kg) <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="weight"
                                    placeholder="Ex: 8"
                                    min="0.1"
                                    max="30"
                                    step="0.1"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Dimensions (optionnel)
                                </label>
                                <input 
                                    type="text" 
                                    id="dimensions"
                                    placeholder="Ex: 40x30x20 cm"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Itinéraire -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                            Itinéraire souhaité
                        </h2>

                        <div class="grid md:grid-cols-2 gap-6">
                            <!-- Départ -->
                            <div class="city-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville de départ <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-map-pin absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="departureCity"
                                        placeholder="Ex: Paris"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div id="departureSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>

                            <!-- Arrivée -->
                            <div class="city-autocomplete relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ville d'arrivée <span class="text-red-500">*</span>
                                </label>
                                <div class="relative">
                                    <i class="fas fa-map-pin absolute left-3 top-3.5 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="arrivalCity"
                                        placeholder="Ex: Casablanca"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div id="arrivalSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
                            </div>
                        </div>

                        <!-- Date préférée -->
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Date préférée (optionnel)
                            </label>
                            <input 
                                type="date" 
                                id="preferredDate"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <!-- Dates flexibles -->
                        <div class="mt-4">
                            <label class="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="flexibleDates"
                                    checked
                                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span class="ml-3 text-gray-700">Dates flexibles</span>
                            </label>
                        </div>
                    </div>

                    <!-- Budget -->
                    <div class="mb-8 border-t pt-8">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-euro-sign text-blue-600 mr-2"></i>
                            Budget
                        </h2>

                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Budget maximum (€) <span class="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            id="budget"
                            placeholder="Ex: 70"
                            min="10"
                            step="1"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />

                        <!-- Cost Estimate -->
                        <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Coût estimé</p>
                                    <p class="text-2xl font-bold text-blue-600">
                                        <span id="estimatedCost">0.00</span> €
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">Basé sur le poids et le prix moyen</p>
                                </div>
                                <i class="fas fa-calculator text-3xl text-blue-300"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="flex justify-end gap-4">
                        <a href="/expediteur" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Annuler
                        </a>
                        <button 
                            type="submit"
                            id="submitBtn"
                            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            Publier mon colis
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/publish-package.js"><\/script>
    </body>
    </html>
  `));g.post("/api/trips",$e,async e=>{const{DB:t}=e.env;try{const s=await e.req.json(),{user_id:a,departure_city:r,departure_country:i="France",arrival_city:n,arrival_country:l="Maroc",departure_date:o,departure_airport:c,arrival_airport:d,flight_number:u,available_weight:x,price_per_kg:p,description:m,flexible_dates:h=0}=s;if(!a||!r||!n||!o||!x||!p)return e.json({success:!1,error:"Missing required fields"},400);const b=await t.prepare(`
      SELECT id, name, kyc_status FROM users WHERE id = ?
    `).bind(a).first();if(!b)return e.json({success:!1,error:"User not found"},404);if(b.kyc_status!=="VERIFIED")return e.json({success:!1,error:"User must complete KYC verification before publishing trips"},403);const v=crypto.randomUUID();await t.prepare(`
      INSERT INTO trips (
        id, user_id, departure_city, departure_country, arrival_city, arrival_country,
        departure_date, departure_airport, arrival_airport, flight_number,
        available_weight, price_per_kg, description, flexible_dates, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).bind(v,a,r,i,n,l,o,c||null,d||null,u||null,x,p,m||null,h).run(),await t.prepare(`
      UPDATE users SET total_trips = total_trips + 1 WHERE id = ?
    `).bind(a).run();const E=await t.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).bind(v).first();return e.json({success:!0,trip:E},201)}catch(s){return e.json({success:!1,error:s.message},500)}});g.put("/api/trips/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");try{const a=await e.req.json(),{user_id:r,departure_city:i,departure_country:n,arrival_city:l,arrival_country:o,departure_date:c,departure_airport:d,arrival_airport:u,flight_number:x,available_weight:p,price_per_kg:m,description:h,flexible_dates:b,status:v}=a,E=await t.prepare(`
      SELECT * FROM trips WHERE id = ?
    `).bind(s).first();if(!E)return e.json({success:!1,error:"Trip not found"},404);if(E.user_id!==r)return e.json({success:!1,error:"Unauthorized"},403);await t.prepare(`
      UPDATE trips SET
        departure_city = COALESCE(?, departure_city),
        departure_country = COALESCE(?, departure_country),
        arrival_city = COALESCE(?, arrival_city),
        arrival_country = COALESCE(?, arrival_country),
        departure_date = COALESCE(?, departure_date),
        departure_airport = COALESCE(?, departure_airport),
        arrival_airport = COALESCE(?, arrival_airport),
        flight_number = COALESCE(?, flight_number),
        available_weight = COALESCE(?, available_weight),
        price_per_kg = COALESCE(?, price_per_kg),
        description = COALESCE(?, description),
        flexible_dates = COALESCE(?, flexible_dates),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(i,n,l,o,c,d,u,x,p,m,h,b,v,s).run();const C=await t.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).bind(s).first();return e.json({success:!0,trip:C})}catch(a){return e.json({success:!1,error:a.message},500)}});g.delete("/api/trips/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),a=e.req.query("user_id");try{const r=await t.prepare(`
      SELECT * FROM trips WHERE id = ?
    `).bind(s).first();return r?r.user_id!==a?e.json({success:!1,error:"Unauthorized"},403):(await t.prepare("DELETE FROM trips WHERE id = ?").bind(s).run(),await t.prepare(`
      UPDATE users SET total_trips = total_trips - 1 WHERE id = ?
    `).bind(a).run(),e.json({success:!0,message:"Trip deleted successfully"})):e.json({success:!1,error:"Trip not found"},404)}catch(r){return e.json({success:!1,error:r.message},500)}});g.get("/api/users/:user_id/trips",async e=>{const{DB:t}=e.env,s=e.req.param("user_id"),a=e.req.query("status");try{let r=`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.reviews_count as traveler_reviews
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `;const i=[s];a&&(r+=" AND t.status = ?",i.push(a)),r+=" ORDER BY t.departure_date DESC";const n=await t.prepare(r).bind(...i).all();return e.json({success:!0,trips:n.results||[]})}catch(r){return e.json({success:!1,error:r.message},500)}});g.post("/api/packages",$e,async e=>{const{DB:t}=e.env;try{const s=await e.req.json(),{user_id:a,title:r,description:i,content_declaration:n,weight:l,dimensions:o,budget:c,departure_city:d,departure_country:u="France",arrival_city:x,arrival_country:p="Maroc",preferred_date:m,flexible_dates:h=1,photos:b=[]}=s;if(!a||!r||!n||!l||!c||!d||!x)return e.json({success:!1,error:"Missing required fields"},400);const v=await t.prepare(`
      SELECT id, name, kyc_status FROM users WHERE id = ?
    `).bind(a).first();if(!v)return e.json({success:!1,error:"User not found"},404);if(v.kyc_status!=="VERIFIED")return e.json({success:!1,error:"User must complete KYC verification before publishing packages"},403);const E=crypto.randomUUID();await t.prepare(`
      INSERT INTO packages (
        id, user_id, title, description, content_declaration, weight, dimensions,
        budget, departure_city, departure_country, arrival_city, arrival_country,
        preferred_date, flexible_dates, photos, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
    `).bind(E,a,r,i,n,l,o||null,c,d,u,x,p,m||null,h,JSON.stringify(b)).run(),await t.prepare(`
      UPDATE users SET total_packages = total_packages + 1 WHERE id = ?
    `).bind(a).run();const C=await t.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(E).first();return e.json({success:!0,package:C},201)}catch(s){return e.json({success:!1,error:s.message},500)}});g.put("/api/packages/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");try{const a=await e.req.json(),{user_id:r,title:i,description:n,content_declaration:l,weight:o,dimensions:c,budget:d,departure_city:u,departure_country:x,arrival_city:p,arrival_country:m,preferred_date:h,flexible_dates:b,photos:v,status:E}=a,C=await t.prepare(`
      SELECT * FROM packages WHERE id = ?
    `).bind(s).first();if(!C)return e.json({success:!1,error:"Package not found"},404);if(C.user_id!==r)return e.json({success:!1,error:"Unauthorized"},403);await t.prepare(`
      UPDATE packages SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        content_declaration = COALESCE(?, content_declaration),
        weight = COALESCE(?, weight),
        dimensions = COALESCE(?, dimensions),
        budget = COALESCE(?, budget),
        departure_city = COALESCE(?, departure_city),
        departure_country = COALESCE(?, departure_country),
        arrival_city = COALESCE(?, arrival_city),
        arrival_country = COALESCE(?, arrival_country),
        preferred_date = COALESCE(?, preferred_date),
        flexible_dates = COALESCE(?, flexible_dates),
        photos = COALESCE(?, photos),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(i,n,l,o,c,d,u,x,p,m,h,b,v?JSON.stringify(v):null,E,s).run();const k=await t.prepare(`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).bind(s).first();return e.json({success:!0,package:k})}catch(a){return e.json({success:!1,error:a.message},500)}});g.delete("/api/packages/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id"),a=e.req.query("user_id");try{const r=await t.prepare(`
      SELECT * FROM packages WHERE id = ?
    `).bind(s).first();return r?r.user_id!==a?e.json({success:!1,error:"Unauthorized"},403):(await t.prepare("DELETE FROM packages WHERE id = ?").bind(s).run(),await t.prepare(`
      UPDATE users SET total_packages = total_packages - 1 WHERE id = ?
    `).bind(a).run(),e.json({success:!0,message:"Package deleted successfully"})):e.json({success:!1,error:"Package not found"},404)}catch(r){return e.json({success:!1,error:r.message},500)}});g.get("/api/users/:user_id/packages",async e=>{const{DB:t}=e.env,s=e.req.param("user_id"),a=e.req.query("status");try{let r=`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.reviews_count as shipper_reviews
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `;const i=[s];a&&(r+=" AND p.status = ?",i.push(a)),r+=" ORDER BY p.created_at DESC";const n=await t.prepare(r).bind(...i).all();return e.json({success:!0,packages:n.results||[]})}catch(r){return e.json({success:!1,error:r.message},500)}});g.get("/voyageur/mes-trajets",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mes Trajets - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .filter-btn.active {
            background-color: #2563eb;
            color: white;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600"><i class="fas fa-user-circle mr-2"></i><span id="userName"></span></span>
                    <a href="/" class="text-blue-600 hover:text-blue-700"><i class="fas fa-home mr-2"></i>Accueil</a>
                </div>
            </div>
        </nav>
        <div id="loader" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">Chargement...</p>
            </div>
        </div>
        <div id="mainContent" class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2"><i class="fas fa-suitcase-rolling text-blue-600 mr-3"></i>Mes Trajets</h1>
                <p class="text-gray-600">Gérez vos trajets et suivez vos gains</p>
            </div>
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Total trajets</p>
                        <i class="fas fa-route text-2xl text-blue-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalTrips">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Trajets actifs</p>
                        <i class="fas fa-check-circle text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statActiveTrips">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Poids total (kg)</p>
                        <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalWeight">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Gains potentiels</p>
                        <i class="fas fa-euro-sign text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-green-600" id="statTotalEarnings">0</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex gap-2">
                    <button class="filter-btn active px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ALL">Tous</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ACTIVE">Actifs</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="COMPLETED">Terminés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="CANCELLED">Annulés</button>
                </div>
                <a href="/voyageur/publier-trajet" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    <i class="fas fa-plus mr-2"></i>Nouveau trajet
                </a>
            </div>
            <div id="tripsContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/traveler-dashboard.js"><\/script>
    </body>
    </html>
  `));g.get("/expediteur/mes-colis",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mes Colis - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .filter-btn.active {
            background-color: #2563eb;
            color: white;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
            <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-16 w-auto">
                    <span class="text-2xl font-bold text-gray-900">Amanah GO</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600"><i class="fas fa-user-circle mr-2"></i><span id="userName"></span></span>
                    <a href="/" class="text-blue-600 hover:text-blue-700"><i class="fas fa-home mr-2"></i>Accueil</a>
                </div>
            </div>
        </nav>
        <div id="loader" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">Chargement...</p>
            </div>
        </div>
        <div id="mainContent" class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2"><i class="fas fa-box text-blue-600 mr-3"></i>Mes Colis</h1>
                <p class="text-gray-600">Gérez vos colis et suivez vos envois</p>
            </div>
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Total colis</p>
                        <i class="fas fa-boxes text-2xl text-blue-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalPackages">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Colis publiés</p>
                        <i class="fas fa-check-circle text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statPublishedPackages">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Poids total (kg)</p>
                        <i class="fas fa-weight-hanging text-2xl text-purple-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-gray-900" id="statTotalWeight">0</p>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm text-gray-600">Budget moyen</p>
                        <i class="fas fa-euro-sign text-2xl text-green-600"></i>
                    </div>
                    <p class="text-3xl font-bold text-green-600" id="statAvgBudget">0</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex gap-2">
                    <button class="filter-btn active px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="ALL">Tous</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="PUBLISHED">Publiés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="RESERVED">Réservés</button>
                    <button class="filter-btn px-4 py-2 rounded-lg border border-gray-300 transition-colors" data-filter="DELIVERED">Livrés</button>
                </div>
                <a href="/expediteur/publier-colis" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    <i class="fas fa-plus mr-2"></i>Nouveau colis
                </a>
            </div>
            <div id="packagesContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/shipper-dashboard.js"><\/script>
    </body>
    </html>
  `));g.get("/api/matches/trips-for-package",async e=>{const{DB:t}=e.env;try{const s=e.req.query("origin"),a=e.req.query("destination"),r=parseFloat(e.req.query("weight")||"0"),i=e.req.query("departure_date"),n=parseFloat(e.req.query("max_price")||"999"),l=e.req.query("flexible_dates")==="true";if(!s||!a||!r)return e.json({success:!1,error:"origin, destination et weight sont requis"},400);let o=`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.email as traveler_email,
        u.avatar_url as traveler_avatar,
        u.rating as traveler_rating,
        u.total_trips as traveler_total_trips,
        u.kyc_status as traveler_kyc
      FROM trips t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.status = 'ACTIVE'
        AND t.available_weight >= ?
        AND t.price_per_kg <= ?
        AND LOWER(t.departure_city) LIKE ?
        AND LOWER(t.arrival_city) LIKE ?
    `;const c=[r,n,`%${s.toLowerCase()}%`,`%${a.toLowerCase()}%`];i&&!l?(o+=" AND DATE(t.departure_date) = DATE(?)",c.push(i)):i&&l&&(o+=" AND DATE(t.departure_date) BETWEEN DATE(?, '-2 days') AND DATE(?, '+2 days')",c.push(i,i)),o+=" ORDER BY t.departure_date ASC, t.price_per_kg ASC LIMIT 50";const{results:d}=await t.prepare(o).bind(...c).all(),u=d.map(x=>{let p=100;const m=x.available_weight-r;m===0?p+=20:m<5?p+=10:m>20&&(p-=5);const h=x.price_per_kg/n;if(h<.5?p+=15:h<.7?p+=10:h<.9&&(p+=5),x.traveler_kyc==="VERIFIED"&&(p+=15),x.traveler_rating>=4.5?p+=10:x.traveler_rating>=4&&(p+=5),x.traveler_total_trips>10&&(p+=5),i){const C=new Date(x.departure_date),k=new Date(i),R=Math.abs((C-k)/(1e3*60*60*24));R===0?p+=15:R===1?p+=10:R<=2&&(p+=5)}const b=(r*x.price_per_kg).toFixed(2),v=(b*.12).toFixed(2),E=(parseFloat(b)+parseFloat(v)).toFixed(2);return{...x,match_score:Math.min(p,100),estimated_cost:b,platform_fee:v,total_cost:E,match_quality:p>=90?"excellent":p>=75?"good":p>=60?"fair":"low"}});return u.sort((x,p)=>p.match_score-x.match_score),e.json({success:!0,matches:u,total:u.length,search_params:{origin:s,destination:a,weight:r,departureDate:i,maxPrice:n,flexibleDates:l}})}catch(s){return console.error("Erreur matching:",s),e.json({success:!1,error:s.message},500)}});g.get("/api/matches/packages-for-trip",async e=>{const{DB:t}=e.env;try{const s=e.req.query("origin"),a=e.req.query("destination"),r=parseFloat(e.req.query("available_weight")||"0"),i=parseFloat(e.req.query("price_per_kg")||"0"),n=e.req.query("departure_date"),l=e.req.query("flexible_dates")==="true";if(!s||!a||!r)return e.json({success:!1,error:"origin, destination et available_weight sont requis"},400);let o=`
      SELECT 
        p.*,
        u.name as shipper_name,
        u.email as shipper_email,
        u.avatar_url as shipper_avatar,
        u.rating as shipper_rating,
        u.total_packages as shipper_total_packages,
        u.kyc_status as shipper_kyc
      FROM packages p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.status = 'PUBLISHED'
        AND p.weight <= ?
        AND LOWER(p.departure_city) LIKE ?
        AND LOWER(p.arrival_city) LIKE ?
    `;const c=[r,`%${s.toLowerCase()}%`,`%${a.toLowerCase()}%`];n&&!l?(o+=" AND DATE(p.preferred_date) = DATE(?)",c.push(n)):n&&l&&(o+=` AND (
        p.flexible_dates = 1 
        OR DATE(p.preferred_date) BETWEEN DATE(?, '-2 days') AND DATE(?, '+2 days')
      )`,c.push(n,n)),o+=" ORDER BY p.created_at DESC LIMIT 50";const{results:d}=await t.prepare(o).bind(...c).all(),u=d.map(x=>{let p=100;const m=x.weight/r;if(m>.8?p+=20:m>.5?p+=15:m>.3?p+=10:m<.1&&(p-=5),i>0){const b=x.weight*i,v=x.budget/b;v>=1.2?p+=15:v>=1?p+=10:v>=.9?p+=5:v<.8&&(p-=10)}if(x.shipper_kyc==="VERIFIED"&&(p+=15),x.shipper_rating>=4.5?p+=10:x.shipper_rating>=4&&(p+=5),x.shipper_total_packages>5&&(p+=5),n&&x.preferred_date){const b=new Date(x.preferred_date),v=new Date(n),E=Math.abs((b-v)/(1e3*60*60*24));E===0?p+=15:E===1?p+=10:E<=2&&(p+=5),x.flexible_dates&&(p+=5)}const h=i>0?(x.weight*i*.88).toFixed(2):null;return{...x,match_score:Math.min(p,100),potential_earnings:h,match_quality:p>=90?"excellent":p>=75?"good":p>=60?"fair":"low"}});return u.sort((x,p)=>p.match_score-x.match_score),e.json({success:!0,matches:u,total:u.length,search_params:{origin:s,destination:a,availableWeight:r,pricePerKg:i,departureDate:n,flexibleDates:l}})}catch(s){return console.error("Erreur matching:",s),e.json({success:!1,error:s.message},500)}});async function ze(e){await e.prepare(`
    CREATE TABLE IF NOT EXISTS exchanges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL,
      trip_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      traveler_id INTEGER NOT NULL,
      receiver_id INTEGER,
      pickup_location TEXT NOT NULL,
      pickup_latitude REAL,
      pickup_longitude REAL,
      pickup_date DATETIME,
      pickup_code TEXT NOT NULL,
      pickup_confirmed BOOLEAN DEFAULT 0,
      pickup_photo_url TEXT,
      pickup_notes TEXT,
      delivery_location TEXT NOT NULL,
      delivery_latitude REAL,
      delivery_longitude REAL,
      delivery_date DATETIME,
      delivery_code TEXT NOT NULL,
      delivery_confirmed BOOLEAN DEFAULT 0,
      delivery_photo_url TEXT,
      delivery_notes TEXT,
      status TEXT DEFAULT 'PENDING',
      transaction_code TEXT NOT NULL,
      amount REAL NOT NULL,
      commission REAL NOT NULL,
      traveler_earnings REAL NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      pickup_confirmed_at DATETIME,
      delivery_confirmed_at DATETIME,
      completed_at DATETIME,
      cancelled_at DATETIME
    )
  `).run(),await e.prepare(`
    CREATE TABLE IF NOT EXISTS exchange_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      message_type TEXT DEFAULT 'TEXT',
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run(),await e.prepare(`
    CREATE TABLE IF NOT EXISTS public_meeting_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      description TEXT,
      hours TEXT,
      safety_rating REAL DEFAULT 5.0,
      is_recommended BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run(),(await e.prepare("SELECT COUNT(*) as count FROM public_meeting_places").first()).count===0&&(await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Gare de Lyon","TRAIN_STATION","Place Louis-Armand, 75012","Paris","France",48.8443,2.3736,"Grande gare SNCF avec de nombreux commerces",'{"all": "24/7"}',5).run(),await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Gare du Nord","TRAIN_STATION","Rue de Dunkerque, 75010","Paris","France",48.8809,2.3553,"Gare internationale Eurostar et Thalys",'{"all": "24/7"}',5).run(),await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Aéroport Charles de Gaulle","AIRPORT","Terminal 2, 95700 Roissy","Paris","France",49.0097,2.5479,"Terminal 2 - Zone publique",'{"all": "24/7"}',5).run(),await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Gare Casa-Voyageurs","TRAIN_STATION","Boulevard Mohammed V","Casablanca","Maroc",33.5925,-7.6187,"Gare ONCF principale de Casablanca",'{"all": "24/7"}',5).run(),await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Aéroport Mohammed V","AIRPORT","Nouasseur, 27000","Casablanca","Maroc",33.3675,-7.5898,"Terminal 1 - Zone publique",'{"all": "24/7"}',5).run(),await e.prepare(`
      INSERT INTO public_meeting_places (name, type, address, city, country, latitude, longitude, description, hours, safety_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind("Morocco Mall","MALL","Boulevard de la Corniche","Casablanca","Maroc",33.5699,-7.6771,"Plus grand centre commercial du Maroc",'{"all": "10h-22h"}',5).run())}function Ze(){return Math.floor(1e5+Math.random()*9e5).toString()}function Qt(e,t){let s=0;const a=new Date(e.preferred_date),r=new Date(t.departure_date),i=Math.abs((a.getTime()-r.getTime())/(1e3*60*60*24));i===0?s+=30:i<=2&&e.flexible_dates?s+=25:i<=2?s+=20:i<=7&&(s+=10);const n=e.origin_city===t.departure_city||e.origin_city===t.origin_city,l=e.destination_city===t.arrival_city||e.destination_city===t.destination_city;n&&l?s+=25:(n||l)&&(s+=15);const o=t.available_weight-(t.reserved_weight||0),c=e.weight;if(c<=o){const p=c/o;p<=.5?s+=20:p<=.8?s+=15:s+=10}else s+=0;const d=e.budget/e.weight,u=t.price_per_kg;if(d>=u){const p=d/u;p>=1.2?s+=15:p>=1?s+=12:s+=8}const x=t.traveler_rating||0;return x>=4.5?s+=10:x>=4?s+=8:x>=3.5?s+=5:x>0&&(s+=3),Math.min(Math.round(s),100)}g.post("/api/matches/trips-for-package",async e=>{const{DB:t}=e.env;try{await ze(t);const s=await e.req.json(),{origin_city:a,destination_city:r,weight:i,budget:n,preferred_date:l,flexible_dates:o=!1,min_rating:c=0,kyc_verified_only:d=!1}=s;if(!a||!r||!i||!n||!l)return e.json({error:"Champs obligatoires manquants"},400);const u=await t.prepare(`
      SELECT 
        t.*,
        u.name as traveler_name,
        u.email as traveler_email,
        u.kyc_status,
        u.rating as traveler_rating
      FROM trips t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'active'
        AND t.departure_city = ?
        AND t.arrival_city = ?
        AND (t.available_weight - COALESCE(t.reserved_weight, 0)) >= ?
      ORDER BY t.departure_date ASC
    `).bind(a,r,i).all();if(!u.results||u.results.length===0)return e.json({matches:[],total:0,message:"Aucun trajet trouvé pour ces critères"});const x={origin_city:a,destination_city:r,weight:i,budget:n,preferred_date:l,flexible_dates:o},p=u.results.map(m=>{const h=Qt(x,m);if(d&&m.kyc_status!=="VERIFIED"||m.traveler_rating<c)return null;const b=m.price_per_kg,v=b*i,E=v*.12,C=v-E,k=28*i-v;return{trip_id:m.id,score:h,traveler:{id:m.user_id,name:m.traveler_name,rating:m.traveler_rating||0,kyc_status:m.kyc_status},trip:{origin_city:m.departure_city,destination_city:m.arrival_city,departure_date:m.departure_date,arrival_date:m.arrival_date,available_weight:m.available_weight-(m.reserved_weight||0),price_per_kg:m.price_per_kg,flexible_dates:m.flexible_dates,flight_number:m.flight_number},pricing:{price_per_kg:b,total_price:Math.round(v*100)/100,commission:Math.round(E*100)/100,traveler_earns:Math.round(C*100)/100,savings:Math.round(k*100)/100,savings_percent:Math.round(k/(28*i)*100)},compatibility:{date_match:h>=20,route_match:h>=40,weight_ok:h>=50,price_ok:h>=60}}}).filter(m=>m!==null).sort((m,h)=>h.score-m.score);return e.json({matches:p,total:p.length,package_details:x,filters:{min_rating:c,kyc_verified_only:d}})}catch(s){return console.error("Error finding trips for package:",s),e.json({error:s.message},500)}});g.post("/api/matches/packages-for-trip",async e=>{const{DB:t}=e.env;try{await ze(t);const s=await e.req.json(),{origin_city:a,destination_city:r,available_weight:i,price_per_kg:n,departure_date:l,flexible_dates:o=!1,min_budget:c=0}=s;if(!a||!r||!i||!n||!l)return e.json({error:"Champs obligatoires manquants"},400);const d=await t.prepare(`
      SELECT 
        p.*,
        u.name as sender_name,
        u.email as sender_email,
        u.kyc_status,
        u.rating as sender_rating
      FROM packages p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
        AND p.departure_city = ?
        AND p.arrival_city = ?
        AND p.weight <= ?
      ORDER BY p.created_at DESC
    `).bind(a,r,i).all();if(!d.results||d.results.length===0)return e.json({matches:[],total:0,message:"Aucun colis trouvé pour ce trajet"});const u={origin_city:a,destination_city:r,available_weight:i,price_per_kg:n,departure_date:l,flexible_dates:o,traveler_rating:5},x=d.results.map(p=>{const m=Qt(p,u);if(p.budget<c)return null;const h=n*p.weight,b=h*.12,v=h-b,E=h,C=28*p.weight-E;return{package_id:p.id,score:m,sender:{id:p.user_id,name:p.sender_name,rating:p.sender_rating||0,kyc_status:p.kyc_status},package:{title:p.title,content:p.content,weight:p.weight,dimensions:p.dimensions,budget:p.budget,preferred_date:p.preferred_date,flexible_dates:p.flexible_dates,photo_url:p.photo_url},pricing:{sender_pays:Math.round(E*100)/100,traveler_earns:Math.round(v*100)/100,commission:Math.round(b*100)/100,savings:Math.round(C*100)/100,savings_percent:Math.round(C/(28*p.weight)*100)},compatibility:{date_match:m>=20,route_match:m>=40,weight_ok:!0,budget_ok:p.budget>=n*p.weight}}}).filter(p=>p!==null).sort((p,m)=>m.score-p.score);return e.json({matches:x,total:x.length,trip_details:{origin_city:a,destination_city:r,available_weight:i,price_per_kg:n,departure_date:l,flexible_dates:o},filters:{min_budget:c}})}catch(s){return console.error("Error finding packages for trip:",s),e.json({error:s.message},500)}});g.post("/api/exchanges/request",$e,async e=>{const{DB:t}=e.env;try{await ze(t);const s=await e.req.json(),{package_id:a,trip_id:r,sender_id:i,traveler_id:n,receiver_id:l,pickup_location:o,pickup_latitude:c,pickup_longitude:d,pickup_date:u,pickup_notes:x,delivery_location:p,delivery_latitude:m,delivery_longitude:h,delivery_date:b,delivery_notes:v}=s;if(!a||!r||!i||!n||!o||!p)return e.json({success:!1,error:"package_id, trip_id, sender_id, traveler_id, pickup_location, delivery_location sont requis"},400);const E=await t.prepare("SELECT * FROM packages WHERE id = ?").bind(a).first(),C=await t.prepare("SELECT * FROM trips WHERE id = ?").bind(r).first();if(!E||!C)return e.json({success:!1,error:"Package ou Trip introuvable"},404);const k=E.weight*C.price_per_kg,R=k*.12,Le=k-R,ye=Ze(),z=Ze(),O=Ze(),We=await t.prepare(`
      INSERT INTO exchanges (
        package_id, trip_id, sender_id, traveler_id, receiver_id,
        pickup_location, pickup_latitude, pickup_longitude, pickup_date, pickup_code, pickup_notes,
        delivery_location, delivery_latitude, delivery_longitude, delivery_date, delivery_code, delivery_notes,
        status, transaction_code, amount, commission, traveler_earnings, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, 'PENDING')
    `).bind(a,r,i,n,l||null,o,c||null,d||null,u||null,ye,x||null,p,m||null,h||null,b||null,z,v||null,O,k,R,Le).run();return e.json({success:!0,exchange_id:We.meta.last_row_id,pickup_code:ye,delivery_code:z,transaction_code:O,amount:k,commission:R,traveler_earnings:Le,message:"Demande d'échange créée avec succès"})}catch(s){return console.error("Erreur création échange:",s),e.json({success:!1,error:s.message},500)}});g.get("/api/exchanges/:id",async e=>{const{DB:t}=e.env,s=e.req.param("id");try{const a=await t.prepare(`
      SELECT 
        e.*,
        p.title as package_title,
        p.weight as package_weight,
        p.departure_city as package_departure,
        p.arrival_city as package_arrival,
        t.departure_city as trip_departure,
        t.arrival_city as trip_arrival,
        t.departure_date as trip_date,
        sender.name as sender_name,
        sender.email as sender_email,
        sender.phone as sender_phone,
        sender.avatar_url as sender_avatar,
        traveler.name as traveler_name,
        traveler.email as traveler_email,
        traveler.phone as traveler_phone,
        traveler.avatar_url as traveler_avatar,
        traveler.rating as traveler_rating,
        traveler.kyc_status as traveler_kyc
      FROM exchanges e
      INNER JOIN packages p ON e.package_id = p.id
      INNER JOIN trips t ON e.trip_id = t.id
      INNER JOIN users sender ON e.sender_id = sender.id
      INNER JOIN users traveler ON e.traveler_id = traveler.id
      WHERE e.id = ?
    `).bind(s).first();return a?e.json({success:!0,exchange:a}):e.json({success:!1,error:"Échange introuvable"},404)}catch(a){return console.error("Erreur récupération échange:",a),e.json({success:!1,error:a.message},500)}});g.put("/api/exchanges/:id/accept",async e=>{const{DB:t}=e.env,s=e.req.param("id");try{return(await t.prepare(`
      UPDATE exchanges 
      SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'PENDING'
    `).bind(s).run()).meta.changes===0?e.json({success:!1,error:"Échange introuvable ou déjà accepté"},404):e.json({success:!0,message:"Échange accepté avec succès"})}catch(a){return console.error("Erreur acceptation échange:",a),e.json({success:!1,error:a.message},500)}});g.put("/api/exchanges/:id/confirm-pickup",async e=>{const{DB:t}=e.env,s=e.req.param("id"),a=await e.req.json(),{pickup_code:r,pickup_photo_url:i}=a;try{const n=await t.prepare("SELECT * FROM exchanges WHERE id = ?").bind(s).first();if(!n)return e.json({success:!1,error:"Échange introuvable"},404);if(n.pickup_code!==r)return e.json({success:!1,error:"Code de collecte invalide"},400);const l=await t.prepare(`
      UPDATE exchanges 
      SET pickup_confirmed = 1, 
          pickup_confirmed_at = CURRENT_TIMESTAMP,
          pickup_photo_url = ?,
          status = 'IN_TRANSIT'
      WHERE id = ?
    `).bind(i||null,s).run();return e.json({success:!0,message:"Collecte confirmée ! Le colis est maintenant en transit."})}catch(n){return console.error("Erreur confirmation collecte:",n),e.json({success:!1,error:n.message},500)}});g.put("/api/exchanges/:id/confirm-delivery",async e=>{const{DB:t}=e.env,s=e.req.param("id"),a=await e.req.json(),{delivery_code:r,delivery_photo_url:i}=a;try{const n=await t.prepare("SELECT * FROM exchanges WHERE id = ?").bind(s).first();if(!n)return e.json({success:!1,error:"Échange introuvable"},404);if(n.delivery_code!==r)return e.json({success:!1,error:"Code de livraison invalide"},400);const l=await t.prepare(`
      UPDATE exchanges 
      SET delivery_confirmed = 1, 
          delivery_confirmed_at = CURRENT_TIMESTAMP,
          delivery_photo_url = ?,
          status = 'DELIVERED',
          completed_at = CURRENT_TIMESTAMP,
          payment_status = 'RELEASED'
      WHERE id = ?
    `).bind(i||null,s).run();return e.json({success:!0,message:"Livraison confirmée ! Le paiement va être libéré au voyageur."})}catch(n){return console.error("Erreur confirmation livraison:",n),e.json({success:!1,error:n.message},500)}});g.get("/api/meeting-places",async e=>{const{DB:t}=e.env,{city:s,country:a,type:r}=e.req.query();try{await ze(t);let i="SELECT * FROM public_meeting_places WHERE is_recommended = 1";const n=[];s&&(i+=" AND LOWER(city) LIKE ?",n.push(`%${s.toLowerCase()}%`)),a&&(i+=" AND LOWER(country) = ?",n.push(a.toLowerCase())),r&&(i+=" AND type = ?",n.push(r)),i+=" ORDER BY safety_rating DESC, name ASC";const{results:l}=await t.prepare(i).bind(...n).all();return e.json({success:!0,meeting_places:l||[]})}catch(i){return console.error("Erreur récupération lieux:",i),e.json({success:!1,error:i.message},500)}});g.get("/search",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recherche Avancée - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-blue-500">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors" data-i18n="nav.home">Accueil</a>
                    <a href="/login" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-i18n="nav.login">Connexion</a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- Title Section -->
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">
                    <i class="fas fa-search text-blue-600 mr-3"></i>
                    <span data-i18n="search.title">Recherche Avancée</span>
                </h2>
                <p class="text-gray-600" data-i18n="search.subtitle">Trouvez le trajet ou colis parfait pour vous</p>
            </div>

            <!-- User Type Selection -->
            <div class="grid md:grid-cols-2 gap-4 mb-8">
                <button id="btnSearchTrips" class="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-blue-500">
                    <div class="text-center">
                        <i class="fas fa-plane-departure text-4xl text-blue-600 mb-3"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2" data-i18n="search.search_trips">Je cherche un trajet</h3>
                        <p class="text-sm text-gray-600" data-i18n="search.search_trips_desc">Pour envoyer un colis</p>
                    </div>
                </button>
                <button id="btnSearchPackages" class="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500">
                    <div class="text-center">
                        <i class="fas fa-box text-4xl text-green-600 mb-3"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2" data-i18n="search.search_packages">Je cherche des colis</h3>
                        <p class="text-sm text-gray-600" data-i18n="search.search_packages_desc">Pour optimiser mon voyage</p>
                    </div>
                </button>
            </div>

            <!-- Search Form for Trips (Expéditeur) -->
            <div id="formSearchTrips" class="bg-white rounded-xl shadow-lg p-6 hidden">
                <h3 class="text-2xl font-bold text-blue-600 mb-6">
                    <i class="fas fa-plane mr-2"></i>
                    <span data-i18n="search.form_trips_title">Trouver un trajet</span>
                </h3>
                <form id="searchTripsForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.origin">Origine</label>
                            <input type="text" name="origin" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Paris, Marseille...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.destination">Destination</label>
                            <input type="text" name="destination" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Casablanca, Marrakech...">
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.weight">Poids (kg)</label>
                            <input type="number" name="weight" required min="0.1" max="30" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="5">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.departure_date">Date départ</label>
                            <input type="date" name="departure_date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.max_price">Prix max (€/kg)</label>
                            <input type="number" name="max_price" min="0" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="15">
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="flexible_dates" id="flexibleDatesTrips" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                        <label for="flexibleDatesTrips" class="ml-3 text-sm text-gray-700" data-i18n="search.flexible_dates">Dates flexibles (±2 jours)</label>
                    </div>
                    <button type="submit" class="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg">
                        <i class="fas fa-search mr-2"></i>
                        <span data-i18n="search.search_button">Rechercher</span>
                    </button>
                </form>
            </div>

            <!-- Search Form for Packages (Voyageur) -->
            <div id="formSearchPackages" class="bg-white rounded-xl shadow-lg p-6 hidden">
                <h3 class="text-2xl font-bold text-green-600 mb-6">
                    <i class="fas fa-box mr-2"></i>
                    <span data-i18n="search.form_packages_title">Trouver des colis</span>
                </h3>
                <form id="searchPackagesForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.origin">Origine</label>
                            <input type="text" name="origin" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Paris, Marseille...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.destination">Destination</label>
                            <input type="text" name="destination" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Casablanca, Marrakech...">
                        </div>
                    </div>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.available_weight">Poids disponible (kg)</label>
                            <input type="number" name="available_weight" required min="1" max="30" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="15">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.price_per_kg">Prix proposé (€/kg)</label>
                            <input type="number" name="price_per_kg" min="0" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="8">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="search.departure_date">Date départ</label>
                            <input type="date" name="departure_date" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="flexible_dates" id="flexibleDatesPackages" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <label for="flexibleDatesPackages" class="ml-3 text-sm text-gray-700" data-i18n="search.flexible_dates">Dates flexibles (±2 jours)</label>
                    </div>
                    <button type="submit" class="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg">
                        <i class="fas fa-search mr-2"></i>
                        <span data-i18n="search.search_button">Rechercher</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
            // Toggle between search types
            const btnSearchTrips = document.getElementById('btnSearchTrips')
            const btnSearchPackages = document.getElementById('btnSearchPackages')
            const formSearchTrips = document.getElementById('formSearchTrips')
            const formSearchPackages = document.getElementById('formSearchPackages')

            btnSearchTrips.addEventListener('click', () => {
                btnSearchTrips.classList.add('border-blue-500')
                btnSearchTrips.classList.remove('border-transparent')
                btnSearchPackages.classList.remove('border-green-500')
                btnSearchPackages.classList.add('border-transparent')
                formSearchTrips.classList.remove('hidden')
                formSearchPackages.classList.add('hidden')
            })

            btnSearchPackages.addEventListener('click', () => {
                btnSearchPackages.classList.add('border-green-500')
                btnSearchPackages.classList.remove('border-transparent')
                btnSearchTrips.classList.remove('border-blue-500')
                btnSearchTrips.classList.add('border-transparent')
                formSearchPackages.classList.remove('hidden')
                formSearchTrips.classList.add('hidden')
            })

            // Handle Trips Search
            document.getElementById('searchTripsForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const params = new URLSearchParams({
                    origin: formData.get('origin'),
                    destination: formData.get('destination'),
                    weight: formData.get('weight'),
                    departure_date: formData.get('departure_date') || '',
                    max_price: formData.get('max_price') || '999',
                    flexible_dates: formData.get('flexible_dates') ? 'true' : 'false',
                    search_type: 'trips'
                })
                window.location.href = \`/results?\${params.toString()}\`
            })

            // Handle Packages Search
            document.getElementById('searchPackagesForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const params = new URLSearchParams({
                    origin: formData.get('origin'),
                    destination: formData.get('destination'),
                    available_weight: formData.get('available_weight'),
                    price_per_kg: formData.get('price_per_kg') || '0',
                    departure_date: formData.get('departure_date') || '',
                    flexible_dates: formData.get('flexible_dates') ? 'true' : 'false',
                    search_type: 'packages'
                })
                window.location.href = \`/results?\${params.toString()}\`
            })

            // Auto-select based on URL param
            const urlParams = new URLSearchParams(window.location.search)
            const searchType = urlParams.get('type')
            if (searchType === 'packages') {
                btnSearchPackages.click()
            } else {
                btnSearchTrips.click()
            }
        <\/script>
    </body>
    </html>
  `));g.get("/results",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Résultats de recherche - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
        <style>
            .match-card {
                transition: all 0.3s ease;
            }
            .match-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .score-badge {
                position: absolute;
                top: -10px;
                right: -10px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-blue-500 sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/search" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i><span data-i18n="common.back">Retour</span>
                    </a>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors" data-i18n="nav.home">Accueil</a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Search Summary -->
            <div id="searchSummary" class="bg-white rounded-xl shadow-md p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">
                            <i id="summaryIcon" class="fas fa-search mr-2"></i>
                            <span id="summaryTitle">Résultats de recherche</span>
                        </h2>
                        <p id="summaryRoute" class="text-gray-600"></p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold text-blue-600" id="resultsCount">0</p>
                        <p class="text-sm text-gray-500" data-i18n="search.results_found">résultats trouvés</p>
                    </div>
                </div>
            </div>

            <!-- Filters & Sorting -->
            <div class="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-sort mr-2"></i><span data-i18n="search.sort_by">Trier par</span>
                    </label>
                    <select id="sortBy" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="score" data-i18n="search.sort_score">Score (meilleur)</option>
                        <option value="price_asc" data-i18n="search.sort_price_asc">Prix (croissant)</option>
                        <option value="price_desc" data-i18n="search.sort_price_desc">Prix (décroissant)</option>
                        <option value="date" data-i18n="search.sort_date">Date (proche)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-star mr-2"></i><span data-i18n="search.filter_rating">Rating min</span>
                    </label>
                    <select id="filterRating" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0" data-i18n="search.filter_rating_all">Tous</option>
                        <option value="3">3+ ⭐</option>
                        <option value="4">4+ ⭐⭐⭐⭐</option>
                        <option value="4.5">4.5+ ⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-shield-alt mr-2"></i><span data-i18n="search.filter_kyc">KYC</span>
                    </label>
                    <select id="filterKYC" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="all" data-i18n="search.filter_kyc_all">Tous</option>
                        <option value="VERIFIED" data-i18n="search.filter_kyc_verified">Vérifiés uniquement</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-chart-line mr-2"></i><span data-i18n="search.filter_score">Score min</span>
                    </label>
                    <select id="filterScore" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="0" data-i18n="search.filter_score_all">Tous</option>
                        <option value="60">60+ (Fair)</option>
                        <option value="75">75+ (Good)</option>
                        <option value="90">90+ (Excellent)</option>
                    </select>
                </div>
            </div>

            <!-- Loading State -->
            <div id="loadingState" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
                <div class="bg-white rounded-xl p-6 skeleton h-64"></div>
            </div>

            <!-- Results Container -->
            <div id="resultsContainer" class="hidden grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Results will be injected here -->
            </div>

            <!-- No Results State -->
            <div id="noResults" class="hidden text-center py-16">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-600 mb-2" data-i18n="search.no_results">Àucun résultat trouvé</h3>
                <p class="text-gray-500 mb-6" data-i18n="search.no_results_desc">Essayez de modifier vos critères de recherche</p>
                <a href="/search" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    <i class="fas fa-redo mr-2"></i><span data-i18n="search.new_search">Nouvelle recherche</span>
                </a>
            </div>
        </div>

        <!-- Contact Modal -->
        <div id="contactModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-envelope mr-2 text-blue-600"></i><span data-i18n="search.contact">Contacter</span>
                    </h3>
                    <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="modalContent"></div>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        <script>
            let allResults = []
            let searchType = ''

            // Parse URL parameters
            const urlParams = new URLSearchParams(window.location.search)
            searchType = urlParams.get('search_type')

            // Fetch results on page load
            async function fetchResults() {
                try {
                    let apiUrl = ''
                    
                    if (searchType === 'trips') {
                        // Expéditeur cherche des trajets
                        apiUrl = '/api/matches/trips-for-package?' + urlParams.toString()
                        document.getElementById('summaryIcon').className = 'fas fa-plane-departure mr-2 text-blue-600'
                        document.getElementById('summaryTitle').textContent = window.t ? window.t('search.trips_available') : 'Trajets disponibles'
                    } else if (searchType === 'packages') {
                        // Voyageur cherche des colis
                        apiUrl = '/api/matches/packages-for-trip?' + urlParams.toString()
                        document.getElementById('summaryIcon').className = 'fas fa-box mr-2 text-green-600'
                        document.getElementById('summaryTitle').textContent = window.t ? window.t('search.packages_available') : 'Colis disponibles'
                    } else {
                        showNoResults()
                        return
                    }

                    const response = await axios.get(apiUrl)
                    
                    if (response.data.success) {
                        allResults = response.data.matches
                        updateSummary(response.data.search_params)
                        displayResults(allResults)
                    } else {
                        showNoResults()
                    }
                } catch (error) {
                    console.error('Erreur:', error)
                    showNoResults()
                }
            }

            function updateSummary(params) {
                const origin = params.origin || '?'
                const destination = params.destination || '?'
                document.getElementById('summaryRoute').innerHTML = 
                    \`<i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>\${origin} <i class="fas fa-arrow-right mx-2"></i> \${destination}\`
            }

            function displayResults(results) {
                document.getElementById('loadingState').classList.add('hidden')
                document.getElementById('resultsCount').textContent = results.length

                if (results.length === 0) {
                    showNoResults()
                    return
                }

                document.getElementById('resultsContainer').classList.remove('hidden')
                const container = document.getElementById('resultsContainer')
                container.innerHTML = ''

                results.forEach(result => {
                    const card = createResultCard(result)
                    container.appendChild(card)
                })
            }

            function createResultCard(result) {
                const div = document.createElement('div')
                div.className = 'match-card bg-white rounded-xl shadow-md p-6 relative cursor-pointer'
                
                const isTrip = searchType === 'trips'
                const themeColor = isTrip ? 'blue' : 'green'
                
                // Score badge
                const scoreColor = result.match_score >= 90 ? 'green' : result.match_score >= 75 ? 'blue' : result.match_score >= 60 ? 'yellow' : 'gray'
                const scoreLabel = result.match_quality === 'excellent' ? 'Excellent' : 
                                   result.match_quality === 'good' ? 'Good' : 
                                   result.match_quality === 'fair' ? 'Fair' : 'Low'

                // User info
                const userName = isTrip ? result.traveler_name : result.shipper_name
                const userAvatar = isTrip ? result.traveler_avatar : result.shipper_avatar
                const userRating = isTrip ? result.traveler_rating : result.shipper_rating
                const userKYC = isTrip ? result.traveler_kyc : result.shipper_kyc
                const userTrips = isTrip ? result.traveler_total_trips : result.shipper_total_packages

                div.innerHTML = \`
                    <div class="score-badge">
                        <div class="bg-\${scoreColor}-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            \${result.match_score}% <i class="fas fa-star ml-1"></i>
                        </div>
                    </div>

                    <!-- User Info -->
                    <div class="flex items-center mb-4">
                        <img src="\${userAvatar || '/static/default-avatar.png'}" alt="\${userName}" class="w-12 h-12 rounded-full mr-3 border-2 border-\${themeColor}-500">
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-800">\${userName}</h3>
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="text-yellow-500 mr-1">\${'⭐'.repeat(Math.floor(userRating || 0))}</span>
                                <span>(\${userRating || 'N/A'})</span>
                                \${userKYC === 'VERIFIED' ? '<i class="fas fa-check-circle text-green-600 ml-2" title="Vérifié"></i>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Trip/Package Info -->
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-map-marker-alt text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${result.departure_city} → \${result.arrival_city}</span>
                        </div>
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-calendar text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${new Date(result.departure_date || result.preferred_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="flex items-center text-gray-700">
                            <i class="fas fa-weight text-\${themeColor}-600 w-5"></i>
                            <span class="text-sm">\${isTrip ? result.available_weight : result.weight} kg</span>
                        </div>
                    </div>

                    <!-- Price Info -->
                    <div class="border-t pt-4 mb-4">
                        \${isTrip ? \`
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Prix total estimé:</span>
                                <span class="text-2xl font-bold text-\${themeColor}-600">\${result.estimated_cost}€</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Commission: \${result.platform_fee}€
                            </div>
                        \` : \`
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Gain potentiel:</span>
                                <span class="text-2xl font-bold text-\${themeColor}-600">\${result.potential_earnings || 'N/A'}€</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Prix: \${result.price_per_kg || 'N/A'}€/kg
                            </div>
                        \`}
                    </div>

                    <!-- CTA Button -->
                    <button onclick="contactUser(\${result.id}, '\${userName}')" class="w-full py-3 bg-\${themeColor}-600 text-white rounded-lg hover:bg-\${themeColor}-700 transition-colors font-bold">
                        <i class="fas fa-envelope mr-2"></i>Contacter
                    </button>
                \`

                return div
            }

            function showNoResults() {
                document.getElementById('loadingState').classList.add('hidden')
                document.getElementById('resultsContainer').classList.add('hidden')
                document.getElementById('noResults').classList.remove('hidden')
            }

            // Contact Modal
            function contactUser(id, name) {
                const modal = document.getElementById('contactModal')
                const content = document.getElementById('modalContent')
                
                content.innerHTML = \`
                    <div class="text-center py-4">
                        <p class="text-gray-700 mb-4">Contacter <strong>\${name}</strong></p>
                        <p class="text-sm text-gray-500 mb-6">
                            Cette fonctionnalité sera bientôt disponible. 
                            Un système de chat en temps réel sera intégré prochainement.
                        </p>
                        <button onclick="closeContactModal()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Compris
                        </button>
                    </div>
                \`
                
                modal.classList.remove('hidden')
            }

            function closeContactModal() {
                document.getElementById('contactModal').classList.add('hidden')
            }

            document.getElementById('closeModal').addEventListener('click', closeContactModal)

            // Filters & Sorting
            document.getElementById('sortBy').addEventListener('change', applyFilters)
            document.getElementById('filterRating').addEventListener('change', applyFilters)
            document.getElementById('filterKYC').addEventListener('change', applyFilters)
            document.getElementById('filterScore').addEventListener('change', applyFilters)

            function applyFilters() {
                let filtered = [...allResults]

                // Filter by rating
                const minRating = parseFloat(document.getElementById('filterRating').value)
                if (minRating > 0) {
                    filtered = filtered.filter(r => {
                        const rating = searchType === 'trips' ? r.traveler_rating : r.shipper_rating
                        return rating >= minRating
                    })
                }

                // Filter by KYC
                const kycFilter = document.getElementById('filterKYC').value
                if (kycFilter === 'VERIFIED') {
                    filtered = filtered.filter(r => {
                        const kyc = searchType === 'trips' ? r.traveler_kyc : r.shipper_kyc
                        return kyc === 'VERIFIED'
                    })
                }

                // Filter by score
                const minScore = parseInt(document.getElementById('filterScore').value)
                if (minScore > 0) {
                    filtered = filtered.filter(r => r.match_score >= minScore)
                }

                // Sort
                const sortBy = document.getElementById('sortBy').value
                if (sortBy === 'score') {
                    filtered.sort((a, b) => b.match_score - a.match_score)
                } else if (sortBy === 'price_asc') {
                    filtered.sort((a, b) => {
                        const priceA = parseFloat(a.estimated_cost || a.potential_earnings || 0)
                        const priceB = parseFloat(b.estimated_cost || b.potential_earnings || 0)
                        return priceA - priceB
                    })
                } else if (sortBy === 'price_desc') {
                    filtered.sort((a, b) => {
                        const priceA = parseFloat(a.estimated_cost || a.potential_earnings || 0)
                        const priceB = parseFloat(b.estimated_cost || b.potential_earnings || 0)
                        return priceB - priceA
                    })
                } else if (sortBy === 'date') {
                    filtered.sort((a, b) => {
                        const dateA = new Date(a.departure_date || a.preferred_date)
                        const dateB = new Date(b.departure_date || b.preferred_date)
                        return dateA - dateB
                    })
                }

                displayResults(filtered)
            }

            // Initialize
            fetchResults()
        <\/script>
    </body>
    </html>
  `));g.get("/prohibited-items",e=>e.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Produits Interdits - Amanah GO</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/i18n.css?v=3" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-md border-b-2 border-red-500 sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <img src="/static/logo-amanah-go-v2.png" alt="Amanah GO" class="h-10 w-auto">
                    <h1 class="text-xl font-bold text-gray-800">Amanah GO</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div id="langSwitcherContainer"></div>
                    <a href="/" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <i class="fas fa-home mr-2"></i>Accueil
                    </a>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <!-- Title Section -->
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-red-100 rounded-full mb-4">
                    <i class="fas fa-ban text-5xl text-red-600"></i>
                </div>
                <h1 class="text-4xl font-bold text-gray-800 mb-2">Liste Noire</h1>
                <p class="text-xl text-gray-600">Produits interdits clairement affichés</p>
                <p class="text-sm text-gray-500 mt-2">Conforme aux réglementations IATA + Douanes France & Maroc</p>
            </div>

            <!-- Warning Banner -->
            <div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-3xl text-red-600 mr-4 mt-1"></i>
                    <div>
                        <h3 class="text-xl font-bold text-red-800 mb-2">⚠️ AVERTISSEMENT IMPORTANT</h3>
                        <p class="text-gray-700 mb-2">
                            Le transport de produits interdits est <strong>STRICTEMENT INTERDIT</strong> et constitue une infraction pénale grave.
                        </p>
                        <p class="text-gray-700 mb-2">
                            <strong>Sanctions encourues :</strong>
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 space-y-1">
                            <li>Amendes jusqu'à <strong>750 000€</strong></li>
                            <li>Peine de prison jusqu'à <strong>10 ans</strong></li>
                            <li>Confiscation des biens</li>
                            <li>Interdiction de territoire</li>
                            <li>Bannissement définitif de la plateforme</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Categories -->
            <div class="space-y-6">
                
                <!-- Category 1: Stupéfiants & Drogues -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-red-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-pills mr-3"></i>
                            1. Stupéfiants & Drogues
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Cannabis (haschisch, marijuana, huile, résine)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Cocaïne et dérivés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Héroïne et opiacés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Amphétamines et méthamphétamines</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>LSD et substances hallucinogènes</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Drogues de synthèse (MDMA, ecstasy)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Médicaments psychotropes sans ordonnance</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Précurseurs chimiques</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 2: Armes & Explosifs -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-red-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-bomb mr-3"></i>
                            2. Armes, Munitions & Explosifs
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Armes à feu (pistolets, fusils, revolvers)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Munitions et cartouches</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Armes blanches (couteaux, épées, poignards)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Explosifs et détonateurs</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Feux d'artifice et pétards</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Tasers et paralysants électriques</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Gaz lacrymogènes et bombes au poivre</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-red-600 mr-2 mt-1"></i>
                                <span>Répliques d'armes (même jouets réalistes)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 3: Produits Dangereux (IATA) -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-orange-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-radiation-alt mr-3"></i>
                            3. Matières Dangereuses (IATA)
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Liquides inflammables (essence, alcool pur >70°)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Gaz comprimés (bonbonnes, aérosols)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Batteries lithium en vrac (>100Wh)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Produits corrosifs (acides, bases fortes)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Matières radioactives</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Mercure et thermomètres au mercure</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Peroxydes organiques</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-orange-600 mr-2 mt-1"></i>
                                <span>Phosphore blanc ou jaune</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 4: Contrefaçons & Propriété Intellectuelle -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-purple-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-copyright mr-3"></i>
                            4. Contrefaçons & Propriété Intellectuelle
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Vêtements et accessoires contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Montres et bijoux de luxe contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Sacs à main et maroquinerie contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Médicaments contrefaits ou non autorisés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>DVD et CD piratés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Logiciels piratés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Produits cosmétiques contrefaits</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-purple-600 mr-2 mt-1"></i>
                                <span>Électronique contrefaite (smartphones, etc.)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 5: Produits Alimentaires Réglementés -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-green-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-apple-alt mr-3"></i>
                            5. Produits Alimentaires Réglementés
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Viandes fraîches ou congelées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Produits laitiers non pasteurisés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Fruits et légumes frais (contrôle phytosanitaire)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Graines et plants (sans autorisation)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Miel et produits de la ruche non certifiés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Alcool >5L ou >18° sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Tabac >200 cigarettes sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-green-600 mr-2 mt-1"></i>
                                <span>Compléments alimentaires non autorisés UE/Maroc</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 6: Produits Culturels & Religieux Sensibles -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-indigo-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-book-open mr-3"></i>
                            6. Contenu Culturel & Religieux Sensible
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel pornographique</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Publications incitant à la haine ou terrorisme</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Livres interdits par les autorités</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Propagande politique extrémiste</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel de prosélytisme offensant</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Symboles nazis ou de haine</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Films ou jeux vidéo interdits aux mineurs</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-indigo-600 mr-2 mt-1"></i>
                                <span>Matériel pédophile (crime grave)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 7: Argent & Valeurs -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-yellow-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-money-bill-wave mr-3"></i>
                            7. Argent, Devises & Objets de Valeur
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Espèces >10 000€ sans déclaration</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Fausse monnaie</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Chèques de banque au porteur non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Lingots d'or ou d'argent non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Bijoux de grande valeur non déclarés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Œuvres d'art protégées ou volées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Antiquités historiques sans certificat</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-yellow-600 mr-2 mt-1"></i>
                                <span>Cryptomonnaies physiques (hardware wallets avec fonds)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Category 8: Produits Animaux & Végétaux -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-teal-600 text-white p-4">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas fa-paw mr-3"></i>
                            8. Faune, Flore & Produits Dérivés
                        </h2>
                    </div>
                    <div class="p-6">
                        <ul class="grid md:grid-cols-2 gap-3">
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Animaux vivants (sans certificat vétérinaire)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Ivoire d'éléphant</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Cornes de rhinocéros</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Peaux d'animaux protégés (CITES)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Corail et coquillages protégés</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Fourrures d'espèces menacées</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Bois exotiques protégés (ébène, teck)</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times-circle text-teal-600 mr-2 mt-1"></i>
                                <span>Plantes rares (orchidées, cactus) sans CITES</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            <!-- Footer Info -->
            <div class="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <h3 class="text-xl font-bold text-blue-800 mb-3">
                    <i class="fas fa-info-circle mr-2"></i>
                    Informations Importantes
                </h3>
                <ul class="space-y-2 text-gray-700">
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Doute ?</strong> En cas de doute, NE TRANSPORTEZ PAS le colis. Contactez nos équipes.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Déclaration obligatoire :</strong> Vous devez déclarer honnêtement le contenu de chaque colis.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Inspection possible :</strong> Les autorités peuvent inspecter les colis à tout moment.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Responsabilité :</strong> Le voyageur ET l'expéditeur sont responsables du contenu.</span>
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-check-circle text-blue-600 mr-2 mt-1"></i>
                        <span><strong>Signalement :</strong> Signalez tout colis suspect via notre plateforme.</span>
                    </li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div class="mt-8 text-center">
                <a href="/" class="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Retour à l'accueil
                </a>
            </div>
        </div>

        <!-- JavaScript -->
        <script src="/static/i18n.js?v=3"><\/script>
        <script src="/static/lang-switcher.js?v=3"><\/script>
        
        <!-- PWA Script -->
        <script src="/static/pwa.js"><\/script>
    </body>
    </html>
  `));const ht=new Bt,Ia=Object.assign({"/src/index.tsx":g});let es=!1;for(const[,e]of Object.entries(Ia))e&&(ht.all("*",t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),ht.notFound(t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),es=!0);if(!es)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{ht as default};
