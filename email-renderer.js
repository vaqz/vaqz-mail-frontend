(function(){
  const modalStyle=document.createElement("style");
  modalStyle.textContent=`
    .reader{position:fixed;inset:0;z-index:100;margin:0;padding:clamp(10px,3vw,32px);background:rgba(15,23,42,.42);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);overflow:auto;overscroll-behavior:contain}
    .reader-card{width:min(100%,980px);height:min(92vh,900px);margin:auto;display:flex;flex-direction:column;background:#fff;border:1px solid rgba(255,255,255,.7);border-radius:20px;overflow:hidden;box-shadow:0 28px 80px rgba(15,23,42,.22);animation:readerIn .18s ease-out}
    .reader-toolbar,.reader-header{flex:0 0 auto}
    .reader-content{flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch}
    .reader-content .email-frame{height:100%;min-height:100%;display:block}
    .reader-content .text-email{min-height:100%;overflow:auto}
    @keyframes readerIn{from{opacity:0;transform:translateY(8px) scale(.992)}to{opacity:1;transform:translateY(0) scale(1)}}
    @media(max-width:700px){.reader{padding:8px}.reader-card{width:100%;height:calc(100vh - 16px);height:calc(100dvh - 16px);border-radius:16px}.reader-toolbar{padding:9px 10px}.reader-header{padding:18px 15px 16px}.reader-content{overflow:auto}}
  `;
  document.head.appendChild(modalStyle);

  const readerSection=document.getElementById("readerSection");
  if(readerSection){
    const syncReaderScrollLock=function(){
      const open=readerSection.style.display!=="none";
      document.documentElement.style.overflow=open?"hidden":"";
      document.body.style.overflow=open?"hidden":"";
    };
    new MutationObserver(syncReaderScrollLock).observe(readerSection,{attributes:true,attributeFilter:["style"]});
    syncReaderScrollLock();
  }

  function sanitizeEmailDocument(html){
    const doc=new DOMParser().parseFromString(String(html||""),"text/html");
    doc.querySelectorAll("script,noscript,iframe,object,embed,form,input,button,base,meta[http-equiv],link[rel=import]").forEach(function(el){el.remove()});
    doc.querySelectorAll("*").forEach(function(el){
      Array.from(el.attributes).forEach(function(attr){
        if(/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      });
    });
    doc.querySelectorAll("a[href]").forEach(function(a){
      let href=(a.getAttribute("href")||"").trim();
      if(/^javascript:|^vbscript:|^data:/i.test(href)){
        a.removeAttribute("href");
        return;
      }
      if(href.startsWith("//")) href="https:"+href;
      if(/^https?:\/\//i.test(href)||/^mailto:/i.test(href)||/^tel:/i.test(href)){
        a.setAttribute("href",href);
        a.setAttribute("target","_blank");
        a.setAttribute("rel","noopener noreferrer");
      }
    });
    const styles=Array.from(doc.querySelectorAll("style")).map(function(style){return style.textContent||""}).join("\n");
    doc.querySelectorAll("style").forEach(function(style){style.remove()});
    return {styles:styles,body:doc.body.innerHTML};
  }

  window.renderEmailContent=function(email){
    if(email&&email.html_content){
      const clean=sanitizeEmailDocument(email.html_content);
      const frame=document.createElement("iframe");
      frame.className="email-frame";
      frame.setAttribute("sandbox","allow-popups allow-popups-to-escape-sandbox");
      frame.setAttribute("title","Email message");
      frame.srcdoc='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
        '<style>'+clean.styles+'\nhtml,body{margin:0;padding:0;background:#fff}body{max-width:100%;overflow-x:auto}img{max-width:100%;height:auto}table{max-width:100%}#vaqz-email-root{max-width:100%;overflow-x:auto}</style>'+
        '</head><body><div id="vaqz-email-root">'+clean.body+'</div></body></html>';
      readerContent.replaceChildren(frame);
      return;
    }
    if(email&&email.text_content){
      readerContent.innerHTML='<div class="text-email"></div>';
      readerContent.querySelector(".text-email").textContent=email.text_content;
      return;
    }
    if(email&&email.raw_body){
      readerContent.innerHTML='<div class="text-email"></div>';
      readerContent.querySelector(".text-email").textContent=email.raw_body;
      return;
    }
    readerContent.innerHTML='<div class="empty"><div class="empty-icon">'+icon("mail")+'</div><div class="empty-title">No message content available</div></div>';
  };
})();
