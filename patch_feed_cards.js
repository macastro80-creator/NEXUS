const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The user said: "Feed: the cards are not clear who is the agent and whi is the client"
// Looking for the name and properties line
// <h3 class="font-black text-xl text-slate-900 dark:text-slate-100 italic leading-none">Family Gómez</h3>
// <p class="text-[10px] font-bold text-slate-500 uppercase">Agent: John Doe</p>

html = html.replace(/<h3 class="font-black text-xl text-slate-900 dark:text-slate-100 italic leading-none">([^<]+)<\/h3>\s*<p class="text-\[10px\] font-bold text-slate-500 uppercase">Agent: ([^<]+)<\/p>/g,
`<p class="text-[8px] font-black text-[#003DA5] dark:text-blue-400 uppercase tracking-widest mb-1"><i class="fa-solid fa-user-tag"></i> Buyer / Cliente</p>
                            <h3 class="font-black text-xl text-slate-900 dark:text-slate-100 italic leading-none mb-2">$1</h3>
                            <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                                <div class="w-6 h-6 rounded-full bg-blue-100 text-[#003DA5] flex items-center justify-center text-[9px] font-black"><i class="fa-solid fa-headset"></i></div>
                                <div>
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Representing Agent</p>
                                    <p class="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight">$2</p>
                                </div>
                            </div>`);

// Also fix it for the Spider Matches, e.g.
// <h3 class="font-black text-xl text-white italic leading-none">Family Smith</h3>
// <p class="text-[10px] font-bold text-indigo-200 uppercase">Agent: Sarah Johnson</p>
html = html.replace(/<h3 class="font-black text-xl text-white italic leading-none">([^<]+)<\/h3>\s*<p class="text-\[10px\] font-bold text-indigo-200 uppercase">Agent: ([^<]+)<\/p>/g,
`<p class="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1"><i class="fa-solid fa-user-tag"></i> Buyer / Cliente</p>
                            <h3 class="font-black text-xl text-white italic leading-none mb-2">$1</h3>
                            <div class="flex items-center gap-2 bg-indigo-900/30 p-2 rounded-xl mb-4 border border-indigo-700/50">
                                <div class="w-6 h-6 rounded-full bg-indigo-100 text-[#003DA5] flex items-center justify-center text-[9px] font-black"><i class="fa-solid fa-headset"></i></div>
                                <div>
                                    <p class="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none">Representing Agent</p>
                                    <p class="text-[10px] font-bold text-white leading-tight">$2</p>
                                </div>
                            </div>`);

fs.writeFileSync('index.html', html, 'utf8');

