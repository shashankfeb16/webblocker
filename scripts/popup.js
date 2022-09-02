var WebUrl;
var Hostname;

chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
    WebUrl = tabs[0].url;
    Hostname = new URL(tabs[0].url).hostname;

    document.getElementById("url").innerText = Hostname;

});

function ErrorShown(text){
    var div = document.createElement("div");
    div.setAttribute("id","Errbox");
    div.innerHTML = ` <div class="Err">
        <p>${text}</p>
    </div>`

    document.getElementsByClassName("bottom")[0].appendChild(div);

    setTimeout(()=>{
        document.getElementById("Errbox").remove()
    },3000)
}

document.getElementById("btn").addEventListener("click",()=>{
    if(WebUrl.toLowerCase().includes("chrome://")){
        ErrorShown("You Cannot block a Chrome Url")
    }
    else{
        chrome.storage.local.get("BlockedUrls",(data)=>{
            if(data.BlockedUrls===undefined){
                chrome.storage.local.set({BlockedUrls:[{status:"In_Progress",url:Hostname}]});
                chrome.tabs.query({active:true,currentWindow:true},tabs=>{
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { from: "popup", subject: "startTimer" }
                    );
                });

                setTimeout(()=>{
                    var blk = new Date();
                    blk.setHours(1,0,0,0);
                    const blkTill = blk.getTime();

                    chrome.storage.local.set({
                        BlockedUrls:[{
                            status: "Blocked", url: Hostname, blk: blkTill
                        }]
                    },5000)
                })
            }
            else{
                if(data.BlockedUrls.some((e)=>e.url===Hostname && e.status==="In_Progress")){
                    ErrorShown("This Url will blocked after some time");

                }
                else if(data.BlockedUrls.some((e)=>e.url===Hostname && e.status==="Blocked")){
                    ErrorShown("This URL is blocked ")
                }
                else{
                    chrome.storage.local.set({BlockedUrls:[...data.BlockedUrls,{status: "In_Progress",url:Hostname}]});
                    chrome.tabs.query({active:true,currentWindow:true},tabs=>{
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {from:"popup",subject:"startTimer"}
                        )
                    });
                    setTimeout(()=>{
                        chrome.storage.local.get("BlockedUrls",(data)=>{
                            data.BlockedUrls.forEach((e,index)=>{
                                if(e.url===Hostname && e.status==="In_Progress"){
                                    var arr = data.BlockedUrls.splice(index,1);

                                    var blk = new Date();
                                    blk.setHours(1,0,0,0);
                                    const blkTill = blk.getTime();

                                    chrome.storage.local.set({BlockedUrls:[...arr,{ status: "Blocked", url: Hostname, blk: blkTill}]})

                                }
                            })
                        })
                    },5000)
                }
            }
        })
    }
})