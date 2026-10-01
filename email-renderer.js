(function(){
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
