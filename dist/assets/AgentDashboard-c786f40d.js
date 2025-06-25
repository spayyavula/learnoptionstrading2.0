import{c as i,r,j as e,A as R,a as b,d as L,Z as v,L as M,T as O}from"./index-b5290ce3.js";import{X as U}from"./x-circle-ae4e8f2d.js";import{R as z}from"./refresh-cw-9177ef34.js";import{D as B}from"./database-dcff735d.js";import{G as D}from"./globe-c4e2972b.js";import{E as w}from"./external-link-2c3b9aea.js";const k=i("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]),Y=i("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]),G=i("Cpu",[["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"9",y:"9",width:"6",height:"6",key:"o3kz5p"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]]),A=i("FileJson",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["path",{d:"M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",key:"1oajmo"}],["path",{d:"M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",key:"mpwhp6"}]]),_=i("Key",[["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["path",{d:"m15.5 7.5 3 3L22 7l-3-3",key:"1rn1fs"}]]),J=i("Server",[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]]),Z=()=>{const[o,d]=r.useState([]),[c,p]=r.useState(""),[h,P]=r.useState(null),[u,y]=r.useState(null),[x,g]=r.useState("idle"),[E,m]=r.useState(!1),[j,n]=r.useState(null);r.useEffect(()=>{(()=>{try{const t=localStorage.getItem("agent_api_keys");if(t){const a=JSON.parse(t);d(a.map(l=>({...l,created:new Date(l.created),lastUsed:l.lastUsed?new Date(l.lastUsed):void 0})))}else{const a={id:"demo-key-1",name:"Demo API Key",key:`opt_${N(32)}`,created:new Date,status:"active"};d([a]),localStorage.setItem("agent_api_keys",JSON.stringify([a]))}}catch(t){console.error("Error loading API keys:",t)}})()},[]);const S=[{path:"/api/v1/market/options",method:"GET",description:"Get available options contracts",parameters:["underlying","expiration","strike"],responseExample:'{"contracts": [{"ticker": "SPY240315C00580000", "underlying": "SPY", "strike": 580, "expiration": "2024-03-15", "type": "call", "bid": 29.05, "ask": 29.15, "last": 29.10}]}',requiresAuth:!0},{path:"/api/v1/portfolio",method:"GET",description:"Get current portfolio positions",responseExample:'{"balance": 100000, "positions": [{"symbol": "AAPL", "quantity": 10, "avgPrice": 175.43, "currentPrice": 178.25}]}',requiresAuth:!0},{path:"/api/v1/orders",method:"POST",description:"Place a new order",parameters:["symbol","quantity","type","orderType","price"],responseExample:'{"orderId": "ord_123456", "status": "pending", "message": "Order placed successfully"}',requiresAuth:!0},{path:"/api/v1/market/data",method:"GET",description:"Get market data for a symbol",parameters:["symbol","timeframe"],responseExample:'{"symbol": "SPY", "price": 580.25, "change": 2.15, "changePercent": 0.37, "volume": 45234567}',requiresAuth:!1}],N=s=>{const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";let a="";for(let l=0;l<s;l++)a+=t.charAt(Math.floor(Math.random()*t.length));return a},I=()=>{if(!c.trim())return;const s={id:`key-${Date.now()}`,name:c.trim(),key:`opt_${N(32)}`,created:new Date,status:"active"},t=[...o,s];d(t),localStorage.setItem("agent_api_keys",JSON.stringify(t)),p(""),m(!1),n(s.key),window.setTimeout(()=>{n&&n(null)},5e3)},C=s=>{const t=o.map(a=>a.id===s?{...a,status:"revoked"}:a);d(t),localStorage.setItem("agent_api_keys",JSON.stringify(t))},T=s=>{navigator.clipboard.writeText(s),n(s),window.setTimeout(()=>{n&&n(null)},5e3)},K=s=>{P(s),g("loading"),y(null),window.setTimeout(()=>{g("success"),y(s.responseExample)},1e3)},f=s=>s.toLocaleDateString()+" "+s.toLocaleTimeString(),q=s=>{try{return JSON.stringify(JSON.parse(s),null,2)}catch{return s}};return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4",children:e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx(R,{className:"h-5 w-5 text-yellow-600"})}),e.jsxs("div",{className:"ml-3",children:[e.jsx("h3",{className:"text-sm font-medium text-yellow-800",children:"API Usage Disclaimer"}),e.jsxs("div",{className:"mt-2 text-sm text-yellow-700",children:[e.jsx("p",{children:"The Options World API is provided for educational and paper trading purposes only. Any automated trading systems or agents built using this API should not be used for real money trading without thorough testing and risk assessment."}),e.jsx("p",{className:"mt-1",children:"API users are responsible for ensuring their implementations comply with all applicable laws and regulations. Options World is not responsible for any losses incurred through the use of this API."})]})]})]})}),e.jsx("div",{className:"card",children:e.jsx("div",{className:"card-header",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Agent API Dashboard"}),e.jsx("p",{className:"text-gray-600 mt-2",children:"Manage API access for AI agents and automated trading systems"})]}),e.jsx(b,{className:"h-12 w-12 text-blue-600"})]})})}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(_,{className:"h-5 w-5 mr-2"}),"API Keys"]}),e.jsx("button",{onClick:()=>m(!0),className:"btn btn-primary",children:"Create New API Key"})]})}),e.jsxs("div",{className:"card-body",children:[o.length===0?e.jsxs("div",{className:"text-center py-8",children:[e.jsx(_,{className:"mx-auto h-12 w-12 text-gray-400"}),e.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No API keys"}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Create an API key to allow agents to access your trading data."})]}):e.jsxs("div",{className:"space-y-4",children:[j&&e.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4 mb-4",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx(L,{className:"h-5 w-5 text-green-500 mr-2"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-green-800",children:"API key copied to clipboard"}),e.jsx("p",{className:"text-xs text-green-600 mt-1",children:"Make sure to save this key as it won't be shown again"})]})]}),e.jsx("div",{className:"mt-2 p-2 bg-green-100 rounded font-mono text-sm text-green-800 break-all",children:j})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-200",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Name"}),e.jsx("th",{className:"px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Created"}),e.jsx("th",{className:"px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Last Used"}),e.jsx("th",{className:"px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Actions"})]})}),e.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:o.map(s=>e.jsxs("tr",{children:[e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap",children:[e.jsx("div",{className:"font-medium text-gray-900",children:s.name}),e.jsxs("div",{className:"text-sm text-gray-500 font-mono",children:[s.key.substring(0,8),"...",s.key.substring(s.key.length-4)]})]}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:f(s.created)}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:s.lastUsed?f(s.lastUsed):"Never"}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsx("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status==="active"?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:s.status==="active"?"Active":"Revoked"})}),e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap text-right text-sm font-medium",children:[e.jsx("button",{onClick:()=>T(s.key),className:"text-blue-600 hover:text-blue-900 mr-3",children:e.jsx(Y,{className:"h-4 w-4"})}),s.status==="active"&&e.jsx("button",{onClick:()=>C(s.id),className:"text-red-600 hover:text-red-900",children:e.jsx(U,{className:"h-4 w-4"})})]})]},s.id))})]})})]}),E&&e.jsx("div",{className:"fixed inset-0 z-50 overflow-y-auto",children:e.jsxs("div",{className:"flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",children:[e.jsx("div",{className:"fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",onClick:()=>m(!1)}),e.jsxs("div",{className:"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full",children:[e.jsx("div",{className:"bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4",children:e.jsx("div",{className:"sm:flex sm:items-start",children:e.jsxs("div",{className:"mt-3 text-center sm:mt-0 sm:text-left w-full",children:[e.jsx("h3",{className:"text-lg leading-6 font-medium text-gray-900 mb-4",children:"Create New API Key"}),e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{htmlFor:"keyName",className:"block text-sm font-medium text-gray-700 mb-1",children:"Key Name"}),e.jsx("input",{type:"text",id:"keyName",className:"form-input",placeholder:"e.g., Trading Bot, Backtest Agent",value:c,onChange:s=>p(s.target.value)}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Give your key a descriptive name to remember what it's used for."})]}),e.jsx("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:e.jsxs("div",{className:"flex",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx(v,{className:"h-5 w-5 text-yellow-600"})}),e.jsxs("div",{className:"ml-3",children:[e.jsx("h3",{className:"text-sm font-medium text-yellow-800",children:"Important"}),e.jsx("div",{className:"mt-2 text-sm text-yellow-700",children:e.jsx("p",{children:"API keys provide full access to your account. Keep them secure and never share them publicly."})})]})]})})]})})}),e.jsxs("div",{className:"bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",children:[e.jsx("button",{type:"button",className:"btn btn-primary",onClick:I,disabled:!c.trim(),children:"Create API Key"}),e.jsx("button",{type:"button",className:"btn btn-secondary mr-2",onClick:()=>m(!1),children:"Cancel"})]})]})]})})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsxs("h3",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(k,{className:"h-5 w-5 mr-2"}),"API Documentation"]})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"Authentication"}),e.jsxs("div",{className:"bg-gray-50 p-4 rounded-lg",children:[e.jsx("p",{className:"text-sm text-gray-700 mb-2",children:"All API requests must include your API key in the Authorization header:"}),e.jsx("div",{className:"bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto",children:"Authorization: Bearer YOUR_API_KEY"})]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"Base URL"}),e.jsxs("div",{className:"bg-gray-50 p-4 rounded-lg",children:[e.jsx("p",{className:"text-sm text-gray-700 mb-2",children:"All API endpoints are relative to:"}),e.jsx("div",{className:"bg-gray-100 p-3 rounded font-mono text-sm",children:"https://api.optionsworld.trade"})]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"Available Endpoints"}),e.jsx("div",{className:"space-y-4",children:S.map(s=>e.jsx("div",{className:"border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer",onClick:()=>K(s),children:e.jsxs("div",{className:"flex items-start p-4",children:[e.jsx("div",{className:`px-2 py-1 rounded text-xs font-medium mr-3 ${s.method==="GET"?"bg-green-100 text-green-800":s.method==="POST"?"bg-blue-100 text-blue-800":"bg-purple-100 text-purple-800"}`,children:s.method}),e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"font-mono text-sm",children:s.path}),e.jsx("div",{className:"text-sm text-gray-600 mt-1",children:s.description}),s.parameters&&e.jsxs("div",{className:"mt-2",children:[e.jsx("div",{className:"text-xs text-gray-500",children:"Parameters:"}),e.jsx("div",{className:"flex flex-wrap gap-1 mt-1",children:s.parameters.map(t=>e.jsx("span",{className:"px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700",children:t},t))})]})]}),e.jsx("div",{children:s.requiresAuth&&e.jsx("span",{className:"px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs",children:"Requires Auth"})})]})},s.path))})]}),h&&e.jsxs("div",{className:"mt-8 border-t border-gray-200 pt-6",children:[e.jsxs("h4",{className:"text-md font-medium text-gray-900 mb-2 flex items-center",children:[e.jsx(J,{className:"h-5 w-5 mr-2"}),"Test Response: ",h.path]}),e.jsx("div",{className:"bg-gray-50 p-4 rounded-lg",children:x==="loading"?e.jsx("div",{className:"flex items-center justify-center h-24",children:e.jsx(z,{className:"h-6 w-6 text-blue-500 animate-spin"})}):x==="success"&&u?e.jsx("pre",{className:"bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono",children:q(u)}):x==="error"?e.jsx("div",{className:"text-red-500",children:"Error fetching response"}):null})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsxs("h3",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(A,{className:"h-5 w-5 mr-2"}),"Agent Integration Examples"]})}),e.jsx("div",{className:"card-body",children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"Python Example"}),e.jsx("pre",{className:"bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:`import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.optionsworld.trade"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get available options contracts
response = requests.get(
    f"{BASE_URL}/api/v1/market/options",
    params={"underlying": "SPY"},
    headers=headers
)

if response.status_code == 200:
    contracts = response.json()["contracts"]
    print(f"Found {len(contracts)} contracts")
else:
    print(f"Error: {response.status_code}")
    print(response.text)`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"JavaScript Example"}),e.jsx("pre",{className:"bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:`const API_KEY = "your_api_key_here";
const BASE_URL = "https://api.optionsworld.trade";

async function placeOrder(symbol, quantity, type, orderType, price) {
  try {
    const response = await fetch(\`\${BASE_URL}/api/v1/orders\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol,
        quantity,
        type,
        orderType,
        price
      })
    });
    
    const data = await response.json();
    console.log('Order placed:', data);
    return data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}`})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"text-md font-medium text-gray-900 mb-2",children:"LangChain Agent Example"}),e.jsx("pre",{className:"bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm",children:`from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_options_data(underlying: str) -> str:
    """Get options data for a specific underlying stock symbol."""
    import requests
    
    API_KEY = "your_api_key_here"
    BASE_URL = "https://api.optionsworld.trade"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/api/v1/market/options",
        params={"underlying": underlying},
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

@tool
def place_trade(symbol: str, quantity: int, order_type: str, price: float = None) -> str:
    """Place a trade order. order_type should be 'buy' or 'sell'."""
    import requests
    
    API_KEY = "your_api_key_here"
    BASE_URL = "https://api.optionsworld.trade"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "symbol": symbol,
        "quantity": quantity,
        "type": order_type,
        "orderType": "market" if price is None else "limit",
    }
    
    if price is not None:
        data["price"] = price
    
    response = requests.post(
        f"{BASE_URL}/api/v1/orders",
        json=data,
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error: {response.status_code} - {response.text}"

# Create the agent
llm = ChatOpenAI(model="gpt-4o")
tools = [get_options_data, place_trade]

prompt = PromptTemplate.from_template(
    """You are an options trading assistant that helps users analyze and execute trades.
    
    {format_instructions}
    
    User query: {input}
    """
)

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Example usage
result = agent_executor.invoke({"input": "Find call options for SPY and recommend a trade"})
print(result["output"])`})]})]})})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsxs("h3",{className:"text-lg font-medium text-gray-900 flex items-center",children:[e.jsx(G,{className:"h-5 w-5 mr-2"}),"Agent Capabilities"]})}),e.jsx("div",{className:"card-body",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"bg-blue-50 p-4 rounded-lg border border-blue-200",children:[e.jsxs("h4",{className:"font-medium text-blue-900 mb-3 flex items-center",children:[e.jsx(b,{className:"h-4 w-4 mr-2"}),"Trading Agents"]}),e.jsxs("ul",{className:"space-y-2 text-sm text-blue-800",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-blue-500 mr-2",children:"•"}),e.jsx("span",{children:"Automated options trading based on predefined strategies"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-blue-500 mr-2",children:"•"}),e.jsx("span",{children:"Real-time market data monitoring and analysis"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-blue-500 mr-2",children:"•"}),e.jsx("span",{children:"Risk management and position sizing automation"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-blue-500 mr-2",children:"•"}),e.jsx("span",{children:"Backtesting strategies against historical data"})]})]})]}),e.jsxs("div",{className:"bg-purple-50 p-4 rounded-lg border border-purple-200",children:[e.jsxs("h4",{className:"font-medium text-purple-900 mb-3 flex items-center",children:[e.jsx(B,{className:"h-4 w-4 mr-2"}),"Data Analysis Agents"]}),e.jsxs("ul",{className:"space-y-2 text-sm text-purple-800",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-purple-500 mr-2",children:"•"}),e.jsx("span",{children:"Options chain analysis and opportunity detection"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-purple-500 mr-2",children:"•"}),e.jsx("span",{children:"Volatility surface modeling and visualization"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-purple-500 mr-2",children:"•"}),e.jsx("span",{children:"Greeks analysis and risk exposure calculation"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-purple-500 mr-2",children:"•"}),e.jsx("span",{children:"Portfolio performance tracking and reporting"})]})]})]}),e.jsxs("div",{className:"bg-green-50 p-4 rounded-lg border border-green-200",children:[e.jsxs("h4",{className:"font-medium text-green-900 mb-3 flex items-center",children:[e.jsx(D,{className:"h-4 w-4 mr-2"}),"Market Analysis Agents"]}),e.jsxs("ul",{className:"space-y-2 text-sm text-green-800",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-green-500 mr-2",children:"•"}),e.jsx("span",{children:"Market regime detection and strategy adaptation"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-green-500 mr-2",children:"•"}),e.jsx("span",{children:"Sentiment analysis from news and social media"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-green-500 mr-2",children:"•"}),e.jsx("span",{children:"Correlation analysis between assets and sectors"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-green-500 mr-2",children:"•"}),e.jsx("span",{children:"Macro economic indicator monitoring"})]})]})]}),e.jsxs("div",{className:"bg-yellow-50 p-4 rounded-lg border border-yellow-200",children:[e.jsxs("h4",{className:"font-medium text-yellow-900 mb-3 flex items-center",children:[e.jsx(v,{className:"h-4 w-4 mr-2"}),"Notification Agents"]}),e.jsxs("ul",{className:"space-y-2 text-sm text-yellow-800",children:[e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-yellow-500 mr-2",children:"•"}),e.jsx("span",{children:"Price alerts and threshold notifications"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-yellow-500 mr-2",children:"•"}),e.jsx("span",{children:"Trade execution confirmations"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-yellow-500 mr-2",children:"•"}),e.jsx("span",{children:"Risk exposure warnings"})]}),e.jsxs("li",{className:"flex items-start",children:[e.jsx("span",{className:"text-yellow-500 mr-2",children:"•"}),e.jsx("span",{children:"Market event notifications"})]})]})]})]})})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Additional Resources"})}),e.jsx("div",{className:"card-body",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs(M,{to:"/app/trading",className:"block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all",children:[e.jsxs("h4",{className:"font-medium text-gray-900 mb-2 flex items-center",children:[e.jsx(O,{className:"h-4 w-4 mr-2 text-blue-600"}),"Trading Platform"]}),e.jsx("p",{className:"text-sm text-gray-600",children:"Access the full trading platform to execute trades manually."})]}),e.jsxs("a",{href:"https://github.com/optionsworld/api-examples",target:"_blank",rel:"noopener noreferrer",className:"block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all",children:[e.jsxs("h4",{className:"font-medium text-gray-900 mb-2 flex items-center",children:[e.jsx(k,{className:"h-4 w-4 mr-2 text-purple-600"}),"GitHub Examples",e.jsx(w,{className:"h-3 w-3 ml-1"})]}),e.jsx("p",{className:"text-sm text-gray-600",children:"Sample code and integration examples on our GitHub repository."})]}),e.jsxs("a",{href:"https://docs.optionsworld.trade/api",target:"_blank",rel:"noopener noreferrer",className:"block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all",children:[e.jsxs("h4",{className:"font-medium text-gray-900 mb-2 flex items-center",children:[e.jsx(A,{className:"h-4 w-4 mr-2 text-green-600"}),"Full API Documentation",e.jsx(w,{className:"h-3 w-3 ml-1"})]}),e.jsx("p",{className:"text-sm text-gray-600",children:"Comprehensive API reference with all endpoints and parameters."})]})]})})]})]})};export{Z as default};
