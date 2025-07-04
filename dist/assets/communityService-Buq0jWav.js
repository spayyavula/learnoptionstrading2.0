const n=()=>({SLACK_WEBHOOK_URL:'https://hooks.slack.com/services/your/slack/webhook<boltArtifact id="stripe-integration" title="Integrate Stripe with Supabase Edge Functions">',DISCORD_WEBHOOK_URL:void 0,TELEGRAM_BOT_TOKEN:void 0,TELEGRAM_CHAT_ID:void 0,TELEGRAM_CHANNEL:void 0,WHATSAPP_GROUP_INVITE:void 0,FACEBOOK_GROUP_ID:void 0});class l{static STORAGE_KEY="community_data";static MESSAGES_KEY="community_messages";static PLATFORMS=[];static initializedPlatforms=!1;static initializeData(){if(!this.initializedPlatforms){const t=n();this.PLATFORMS.length=0,this.PLATFORMS.push({id:"slack",name:"Slack",icon:"💬",color:"#4A154B",url:t.SLACK_WEBHOOK_URL,isConfigured:!0},{id:"discord",name:"Discord",icon:"🎮",color:"#5865F2",url:t.DISCORD_WEBHOOK_URL,isConfigured:!1},{id:"telegram",name:"Telegram",icon:"✈️",color:"#0088CC",url:`https://t.me/${t.TELEGRAM_CHANNEL}`,isConfigured:!1},{id:"whatsapp",name:"WhatsApp",icon:"📱",color:"#25D366",url:`https://chat.whatsapp.com/${t.WHATSAPP_GROUP_INVITE}`,isConfigured:!1},{id:"facebook",name:"Facebook",icon:"📘",color:"#1877F2",url:`https://facebook.com/groups/${t.FACEBOOK_GROUP_ID}`,isConfigured:!1}),this.initializedPlatforms=!0}localStorage.getItem(this.STORAGE_KEY)||localStorage.setItem(this.STORAGE_KEY,JSON.stringify({totalMembers:15420,activeToday:342,tradesShared:1250,platformStats:[{platform:"Discord",members:8500},{platform:"Telegram",members:3200},{platform:"Slack",members:2100},{platform:"WhatsApp",members:1200},{platform:"Facebook",members:420}]})),localStorage.getItem(this.MESSAGES_KEY)||localStorage.setItem(this.MESSAGES_KEY,JSON.stringify([{id:"1",platform:"discord",content:"Great SPY call analysis! Thanks for sharing the setup.",author:"TraderMike",timestamp:new Date(Date.now()-5*60*1e3).toISOString(),type:"discussion"},{id:"2",platform:"telegram",content:"BUY AAPL $185 Call - Strong bullish momentum detected",author:"OptionsBot",timestamp:new Date(Date.now()-15*60*1e3).toISOString(),type:"trade_alert"},{id:"3",platform:"slack",content:"Market regime analysis: Transitioning to high volatility phase",author:"MarketAnalyst",timestamp:new Date(Date.now()-30*60*1e3).toISOString(),type:"analysis"},{id:"4",platform:"discord",content:"Just closed my TSLA position for a 15% gain. The key was timing the entry after the earnings dip.",author:"ElectricTrader",timestamp:new Date(Date.now()-2*60*60*1e3).toISOString(),type:"trade_alert"},{id:"5",platform:"whatsapp",content:"Anyone watching the Fed announcement today? Expecting volatility in the QQQ options chain.",author:"MarketWatcher",timestamp:new Date(Date.now()-3*60*60*1e3).toISOString(),type:"discussion"},{id:"6",platform:"telegram",content:"MARKET UPDATE: S&P 500 breaks key resistance level at 5200. Watch for continuation pattern.",author:"ChartMaster",timestamp:new Date(Date.now()-4*60*60*1e3).toISOString(),type:"market_update"},{id:"7",platform:"slack",content:"Iron condor strategy working well in this sideways market. 80% probability of profit with 45 DTE.",author:"OptionsPro",timestamp:new Date(Date.now()-5*60*60*1e3).toISOString(),type:"analysis"}]))}static getPlatforms(){return[...this.PLATFORMS]}static getConfiguredPlatforms(){return this.PLATFORMS.filter(t=>t.isConfigured)}static async shareTradingAlert(t,e=[]){const a=this.formatTradingAlert(t),r=e.length>0?this.PLATFORMS.filter(o=>e.includes(o.id)):this.getConfiguredPlatforms(),s=r.map(o=>this.sendMessage(o.id,a,"trade_alert",t.symbol));try{await Promise.allSettled(s),console.log(`Trading alert shared to ${r.length} platforms`),this.addLocalMessage({platform:r[0]?.id||"discord",content:a,author:"You",type:"trade_alert"})}catch(o){console.error("Failed to share trading alert:",o)}}static async shareMarketAnalysis(t,e,a=[]){const r=this.formatMarketAnalysis(t,e),s=a.length>0?this.PLATFORMS.filter(i=>a.includes(i.id)):this.getConfiguredPlatforms(),o=s.map(i=>this.sendMessage(i.id,r,"analysis"));try{await Promise.allSettled(o),console.log(`Market analysis shared to ${s.length} platforms`),this.addLocalMessage({platform:s[0]?.id||"discord",content:r,author:"You",type:"analysis"})}catch(i){console.error("Failed to share market analysis:",i)}}static joinPlatform(t){const e=this.PLATFORMS.find(a=>a.id===t);e?.url?window.open(e.url,"_blank","noopener,noreferrer"):console.warn(`Platform ${t} not configured or URL not available`)}static async sendMessage(t,e,a,r){switch(t){case"slack":await this.sendToSlack(e,a,r);break;case"discord":await this.sendToDiscord(e,a,r);break;case"telegram":await this.sendToTelegram(e,a);break;case"whatsapp":this.shareToWhatsApp(e);break;case"facebook":this.shareToFacebook(e);break;default:console.warn(`Platform ${t} not supported`)}}static async sendToSlack(t,e,a){const{SLACK_WEBHOOK_URL:r}=n();try{await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t,username:"Options World Bot",icon_emoji:":chart_with_upwards_trend:",blocks:[{type:"section",text:{type:"mrkdwn",text:t}}]})})}catch(s){console.error("Failed to send to Slack:",s)}}static async sendToDiscord(t,e,a){{console.warn("Discord webhook URL not configured");return}}static async sendToTelegram(t,e){{console.warn("Telegram bot token or chat ID not configured");return}}static shareToWhatsApp(t){const e=encodeURIComponent(t);window.open(`https://wa.me/?text=${e}`,"_blank")}static shareToFacebook(t){const e=encodeURIComponent(t);window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}&quote=${e}`,"_blank")}static formatTradingAlert(t){const e=t.action==="buy"?"🟢":"🔴",a=t.action.toUpperCase();return`${e} **TRADING ALERT** ${e}

**${a} ${t.symbol}**
💰 Price: $${t.price.toFixed(2)}
📊 Quantity: ${t.quantity}
🎯 Strategy: ${t.strategy}

**Analysis:**
${t.reasoning}

⚠️ This is for educational purposes only. Not financial advice.

#OptionsTrading #${t.symbol} #TradingAlert`}static formatMarketAnalysis(t,e){return`📈 **MARKET ANALYSIS** 📈

**${t}**

${e}

💡 Join our community for more insights and trading discussions!

#MarketAnalysis #OptionsTrading #TradingCommunity`}static addLocalMessage(t){const e=this.getRecentMessages(),a={id:Date.now().toString(),platform:t.platform,content:t.content,author:t.author,timestamp:new Date,type:t.type};e.unshift(a);const r=e.slice(0,50);localStorage.setItem(this.MESSAGES_KEY,JSON.stringify(r.map(o=>({...o,timestamp:o.timestamp.toISOString()}))));const s=this.getCommunityStats();s.tradesShared+=1,localStorage.setItem(this.STORAGE_KEY,JSON.stringify(s))}static getCommunityStats(){try{const t=localStorage.getItem(this.STORAGE_KEY);if(t)return JSON.parse(t)}catch(t){console.error("Error loading community stats:",t)}return{totalMembers:15420,activeToday:342,tradesShared:1250,platformStats:[{platform:"Discord",members:8500},{platform:"Telegram",members:3200},{platform:"Slack",members:2100},{platform:"WhatsApp",members:1200},{platform:"Facebook",members:420}]}}static getRecentMessages(){try{const t=localStorage.getItem(this.MESSAGES_KEY);if(t)return JSON.parse(t).map(a=>({...a,timestamp:new Date(a.timestamp)}))}catch(t){console.error("Error loading community messages:",t)}return[]}static hasConfiguredPlatforms(){return this.getConfiguredPlatforms().length>0}static getPlatformStatus(){return this.PLATFORMS.reduce((t,e)=>(t[e.id]=e.isConfigured,t),{})}static async shareJournalEntry(t,e=[]){const a=this.formatJournalEntry(t),r=e.length>0?this.PLATFORMS.filter(o=>e.includes(o.id)):this.getConfiguredPlatforms(),s=r.map(o=>this.sendMessage(o.id,a,"trade_alert",t.underlyingTicker));try{await Promise.allSettled(s),console.log(`Journal entry shared to ${r.length} platforms`),this.addLocalMessage({platform:r[0]?.id||"discord",content:a,author:"You",type:"trade_alert"})}catch(o){console.error("Failed to share journal entry:",o)}}static formatJournalEntry(t){const e=t.outcome==="win"?"✅":t.outcome==="loss"?"❌":"⚖️";return`📝 **TRADE JOURNAL** 📝

**${t.contractTicker} (${t.underlyingTicker})**
📊 Strategy: ${t.strategy}
💰 Entry: $${t.entryPrice.toFixed(2)} | Exit: $${t.exitPrice?.toFixed(2)||"Open"}
🔢 Quantity: ${t.quantity}
${e} Outcome: ${t.outcome?.toUpperCase()||"OPEN"} ${t.pnl?`(${t.pnl>=0?"+":""}$${t.pnl.toFixed(2)})`:""}

**Reasoning:**
${t.reasoning}

**Market Context:**
${t.marketContext}

**Lessons Learned:**
${t.lessonsLearned}

${t.tags.map(a=>`#${a}`).join(" ")}
#TradingJournal #OptionsTrading`}static async sharePosition(t,e=[]){const a=this.formatPosition(t),r=e.length>0?this.PLATFORMS.filter(o=>e.includes(o.id)):this.getConfiguredPlatforms(),s=r.map(o=>this.sendMessage(o.id,a,"trade_alert",t.underlyingTicker));try{await Promise.allSettled(s),console.log(`Position shared to ${r.length} platforms`),this.addLocalMessage({platform:r[0]?.id||"discord",content:a,author:"You",type:"trade_alert"})}catch(o){console.error("Failed to share position:",o)}}static formatPosition(t){const e=t.unrealizedPnL>=0?"🟢":"🔴",a=t.unrealizedPnL>=0?"+":"";return`${e} **POSITION UPDATE** ${e}

**${t.contractTicker} (${t.underlyingTicker})**
📊 Type: ${t.contractType.toUpperCase()}
💰 Strike: $${t.strikePrice.toFixed(2)} | Expiry: ${t.expirationDate}
🔢 Quantity: ${t.quantity}
💵 Current Price: $${t.currentPrice.toFixed(2)}
📈 P&L: ${a}$${t.unrealizedPnL.toFixed(2)} (${a}${t.unrealizedPnLPercent.toFixed(2)}%)

**Greeks:**
Delta: ${t.delta.toFixed(3)}
Gamma: ${t.gamma.toFixed(3)}
Theta: ${t.theta.toFixed(3)}
Vega: ${t.vega.toFixed(3)}

#OptionsTrading #${t.underlyingTicker} #PositionUpdate`}static configurePlatform(t,e){return console.log(`Configuring platform ${t} with:`,e),!0}}export{l as CommunityService};
