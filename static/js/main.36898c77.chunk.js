(this["webpackJsonpsql-in-mongodb"]=this["webpackJsonpsql-in-mongodb"]||[]).push([[0],{28:function(e,t,n){"use strict";n.r(t);var c=n(1),r=n(8),o=n.n(r),i=n(3),s=n(4),l=n(9),a=n(2),d=new l.SQLParser,j=function(){var e=Object(c.useState)("select * from t where (a = 1 and b = 2) or c = 3"),t=Object(i.a)(e,2),n=t[0],r=t[1],o=Object(c.useState)(""),l=Object(i.a)(o,2),j=l[0],h=l[1],b=Object(c.useState)(""),g=Object(i.a)(b,2),m=g[0],u=g[1],O=Object(c.useState)(null),x=Object(i.a)(O,2),f=x[0],p=x[1],y=function(e){r(e)},v=function(){var e;try{e=d.parseSql(n),h(JSON.stringify(e,null,2)),p(null)}catch(f){p(f),console.log(f)}try{var t=d.getSelectedTable(n);u("db.".concat(t,".find(").concat(JSON.stringify(e),")")),p(null)}catch(f){p(f),console.log(f)}};return Object(c.useEffect)((function(){v()}),[]),Object(a.jsxs)("div",{style:{backgroundColor:"#272822"},children:[Object(a.jsx)("div",{children:Object(a.jsx)("a",{title:"SQL-in-MongoDB on GitHub",href:"https://github.com/Ligengxin96/sql-in-mongodb",target:"_blank",rel:"noreferrer",style:{textDecoration:"none"},children:Object(a.jsxs)("h2",{style:{margin:"0 0 0rem 1rem",padding:"1rem 0 0 0"},children:[Object(a.jsx)("span",{style:{color:"#e6db74"},children:"SQL-in-MongoDB"}),Object(a.jsx)("span",{style:{color:"#ffffff"},children:" Demo"})]})})}),Object(a.jsxs)("div",{style:{display:"flex"},children:[Object(a.jsxs)("div",{style:{width:"48vw",marginLeft:"1rem"},children:[Object(a.jsx)("h4",{style:{backgroundColor:"#ec9652",marginBottom:"0"},children:Object(a.jsx)("span",{style:{color:"#aa5714",padding:"8px",fontSize:"1.1rem"},children:"SQL Statement"})}),Object(a.jsx)("div",{style:{borderColor:"#ec9652"},children:Object(a.jsx)(s.a,{height:"36vh",defaultLanguage:"sql",theme:"vs-dark",defaultValue:n,value:n,onChange:y})}),Object(a.jsx)("h4",{style:{backgroundColor:f?"#fca4c3":"#daf6a1",marginBottom:"0"},children:Object(a.jsx)("span",{style:{color:f?"#CB0048":"#557B0A",padding:"8px",fontSize:"1.1rem"},children:f?f.message:"Mongo Query"})}),Object(a.jsx)("div",{children:Object(a.jsx)(s.a,{height:"36vh",defaultLanguage:"javascript",theme:"vs-dark",options:{readOnly:!0},value:m,onChange:y})})]}),Object(a.jsx)("div",{style:{padding:"10rem 1rem"},children:Object(a.jsx)("button",{onClick:v,style:{backgroundColor:"#08C988",boxShadow:"0 1px 2px 0",borderRadius:"4px",height:"3rem",width:"5rem"},children:"convert"})}),Object(a.jsx)("div",{style:{width:"48vw",paddingRight:"1.5rem"},children:Object(a.jsxs)("div",{children:[Object(a.jsx)("h4",{style:{backgroundColor:f?"#fca4c3":"#daf6a1",marginBottom:"0"},children:Object(a.jsx)("span",{style:{color:f?"#CB0048":"#557B0A",padding:"8px",fontSize:"1.1rem"},children:f?f.message:"Mongo Query Condition"})}),Object(a.jsx)(s.a,{height:"77vh",defaultLanguage:"json",theme:"vs-dark",options:{readOnly:!0},value:j})]})})]}),Object(a.jsxs)("div",{style:{textAlign:"center",alignItems:"center",color:"#e6db74",paddingTop:"2rem",height:"9.7vh"},children:[Object(a.jsx)("h4",{style:{margin:"0"},children:"SQL-in-MongoDB"}),Object(a.jsx)("h4",{style:{margin:"0"},children:"\xa9 Ligengxin@gmail.com"})]})]})};o.a.render(Object(a.jsx)(j,{}),document.getElementById("root"))}},[[28,1,2]]]);
//# sourceMappingURL=main.36898c77.chunk.js.map