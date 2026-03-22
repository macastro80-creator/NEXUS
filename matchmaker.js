// matchmaker.js

// Simulate the Matchmaker API engine running in the background Native App Style
document.addEventListener('DOMContentLoaded', () => {
    // Wait 3 seconds to simulate engine processing after a new search is posted
    setTimeout(runPremiumAutoMatch, 3000);
});

async function runPremiumAutoMatch() {
    try {
        // Fetch real data from the REMAX CCA endpoints (cached locally for prototype)
        const [propsRes, agentsRes] = await Promise.all([
            fetch('https://api.remax-cca.com/api/PropertiesPerOffice/FEA8746D-CC1D-41B8-89F3-D04AC98274AF'),
            fetch('https://api.remax-cca.com/api/AgentsPerOffice/FEA8746D-CC1D-41B8-89F3-D04AC98274AF')
        ]);
        
        const properties = await propsRes.json();
        const agents = await agentsRes.json();
        
        // Find a Premium Property to match against
        // We will use Listing 113149 ("Mountain View Land...") as our demo Match
        const matchedProperty = properties.find(p => p.ListingId === 113149) || properties[0];
        
        // We identify the Listing Agent. We'll use Alejandra for the demo, simulating that SHE is the listing agent receiving the notification.
        const listingAgent = agents.find(a => a.FirstName === 'Alejandra') || agents[0];
        
        injectPremiumNotification(matchedProperty, listingAgent);
        
        // Visually alert the UI (pulse the bell notification badge)
        const bellBadge = document.querySelector('.fa-bell').nextElementSibling;
        if(bellBadge) {
            bellBadge.classList.remove('hidden');
            bellBadge.classList.add('animate-pulse');
            bellBadge.style.backgroundColor = '#fbbf24'; // turn amber for premium
        }
    } catch (error) {
        console.error("Matchmaker Error:", error);
    }
}

function injectPremiumNotification(property, agent) {
    const panel = document.getElementById('notificationsPanel');
    if(!panel) return;
    
    const container = panel.querySelector('.overflow-y-auto');
    if(!container) return;
    
    // Create the Premium Match element
    const notif = document.createElement('div');
    notif.className = "bg-gradient-to-r from-amber-50 to-white dark:from-slate-800 dark:to-slate-800 p-3 rounded-2xl border border-amber-200 dark:border-amber-600/50 shadow-md flex gap-3 items-start relative overflow-hidden group hover:border-amber-400 transition-colors cursor-pointer mb-3";
    
    notif.innerHTML = `
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
        <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
            <i class="fa-solid fa-bolt text-sm"></i>
        </div>
        <div class="flex-1">
            <div class="flex justify-between items-start">
                <p class="text-[10px] font-black text-amber-600 uppercase mb-0.5 tracking-widest flex items-center gap-1">
                    ⚡ Premium Auto-Match
                </p>
                <span class="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full">95% MATCH</span>
            </div>
            <p class="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed pr-2 mt-1">
                Your listing <span class="text-slate-800 dark:text-white font-black">"${property.ListingTitle_en.substring(0, 35)}..."</span> perfectly fits a new buyer search in <span class="text-amber-500 font-black">Pérez Zeledón</span>.
            </p>
            <div class="mt-3 flex gap-2 w-full">
                <button onclick="handlePremiumDismissClick(event, this)" class="w-10 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <button onclick="handlePremiumSendClick(event, '${property.ListingKey}', '${property.ListingTitle_en.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" class="flex-1 bg-amber-400 text-amber-900 py-2 rounded-xl font-black uppercase text-[9px] shadow-sm hover:bg-amber-500 transition-colors">
                    Send Match Now
                </button>
            </div>
            <p class="text-[8px] font-black text-slate-400 uppercase mt-2">Just now</p>
        </div>
    `;
    
    // Prepend to the top of the notifications list
    container.insertBefore(notif, container.firstChild);
}

// Global handler for the auto-match send button so it pre-fills the Send Modal
window.handlePremiumSendClick = function(event, listingKey, listingTitle) {
    event.stopPropagation(); // Prevent closing the panel or triggering parent clicks
    
    // Open the modal
    if (typeof openSendPropertyModal === 'function') {
        openSendPropertyModal("Roberto M.", "Pérez Zeledón • Finca / Farm • $250k - $450k", "https://www.remax-altitud.cr/property/" + listingKey, listingTitle, event.currentTarget);
    } else {
        document.getElementById('sendPropertyModal').classList.remove('hidden');
        document.getElementById('sendPropertyModal').classList.add('flex');
    }
    
    // Pre-fill the Input Field
    setTimeout(() => {
        const input = document.getElementById('propLink');
        if(input) {
            input.value = "https://www.remax-altitud.cr/property/" + listingKey;
            input.classList.add('ring-2', 'ring-amber-400', 'bg-amber-50', 'dark:bg-amber-900/20');
        }
    }, 100);
};

// Global handler for dismissing/declining a premium match
window.handlePremiumDismissClick = function(event, buttonElement) {
    event.stopPropagation(); // Prevent opening the modal
    
    // Find the parent notification card
    const card = buttonElement.closest('.bg-gradient-to-r');
    if (card) {
        // Change the card to a "Declined" visual state
        card.classList.add('opacity-50', 'grayscale');
        
        // Remove the left amber border stripe
        const stripe = card.querySelector('.bg-amber-400');
        if (stripe) stripe.classList.replace('bg-amber-400', 'bg-slate-300');
        
        // Change the buttons to a single "Declined" text
        const buttonsContainer = card.querySelector('.mt-3.flex.gap-2');
        if (buttonsContainer) {
            buttonsContainer.innerHTML = `
                <div class="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-400 py-2 rounded-xl text-center font-black uppercase text-[9px]">
                    <i class="fa-solid fa-ban mr-1"></i> Match Declined
                </div>
            `;
        }
    }
};
