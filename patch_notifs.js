const fs = require('fs');

// The notification panel HTML needed for all pages
const notifPanel = `
    <!-- NOTIFICATIONS PANEL (Matchmaker) -->
    <div id="notificationsPanel" class="fixed inset-0 z-[100] bg-slate-900/60 hidden flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-6 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-slideUp sm:animate-fade">
            
            <!-- Header -->
            <div class="bg-[#003DA5] p-6 text-white flex justify-between items-center shrink-0">
                <div>
                    <h2 class="text-xl font-black italic tracking-tighter uppercase leading-none lang-en">Notifications</h2>
                    <h2 class="text-xl font-black italic tracking-tighter uppercase leading-none lang-es hidden">Notificaciones</h2>
                    <p class="text-[10px] uppercase font-bold text-blue-200 mt-1">NEXUS Matchmaker</p>
                </div>
                <button onclick="toggleNotifications()" class="text-white/50 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                <!-- Reminder Item -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-[#003DA5] shadow-sm relative group">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 text-[#003DA5] flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-calendar-check text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs font-black text-slate-900 dark:text-white mb-0.5 lang-en">Daily OKR Reminder</p>
                            <p class="text-xs font-black text-slate-900 dark:text-white mb-0.5 lang-es hidden">Recordatorio Diario OKR</p>
                            <p class="text-[10px] text-slate-500 font-bold leading-tight lang-en">You successfully logged your OKR today. Keep building your pipeline!</p>
                            <p class="text-[10px] text-slate-500 font-bold leading-tight lang-es hidden">Registraste tu OKR de hoy con éxito. ¡Sigue construyendo tu embudo!</p>
                            <p class="text-[8px] text-slate-400 font-black uppercase mt-2">Just Now</p>
                        </div>
                    </div>
                </div>

                <!-- Request Review Item -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-indigo-500 shadow-sm relative group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-star text-xs"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-xs font-black text-slate-900 dark:text-white mb-0.5 lang-en">Qualification Request</p>
                            <p class="text-xs font-black text-slate-900 dark:text-white mb-0.5 lang-es hidden">Solicitud de Calificación</p>
                            <p class="text-[10px] text-slate-500 font-bold leading-tight"><span class="font-black text-slate-700 dark:text-slate-300">Marcelo R.</span> <span class="lang-en">requested a review for the Escazú collaboration.</span><span class="lang-es hidden">solicitó una reseña por la colaboración en Escazú.</span></p>
                            <p class="text-[8px] text-slate-400 font-black uppercase mt-2">2 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
                <button onclick="toggleNotifications()" class="w-full py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors tracking-widest lang-en">Close Notifications</button>
                <button onclick="toggleNotifications()" class="w-full py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors tracking-widest lang-es hidden">Cerrar Notificaciones</button>
            </div>
        </div>
    </div>
    
    <script>
        function toggleNotifications() {
            const panel = document.getElementById('notificationsPanel');
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                panel.classList.add('flex');
            } else {
                panel.classList.add('hidden');
                panel.classList.remove('flex');
            }
        }
    </script>
</body>`;

const bellHtml = `
            <button onclick="toggleNotifications()" class="relative text-slate-400 hover:text-[#003DA5] text-xl px-1 hover:scale-110 transition-transform">
                <i class="fa-solid fa-bell"></i>
                <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ED1C24] rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <a href="REMAX_APP.html"`;

const files = ['my-desk.html', 'market.html', 'profile.html'];

files.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    
    // Add the bell to the nav
    // Find where the gem/moon icons are in the top nav
    html = html.replace(/<a href="REMAX_APP\.html"/, bellHtml);

    // Add the panel before </body>
    if (!html.includes('id="notificationsPanel"')) {
        html = html.replace(/<\/body>/, notifPanel);
    }
    
    fs.writeFileSync(file, html, 'utf8');
});
