// ==========================================
// NEXUS: Dynamic Locations Fetching (Lazy Load)
// ==========================================

// Ensure we have a local guaranteed client just in case db-service parsing failed due to caches
function getLocationsClient() {
    if (typeof supabase !== 'undefined' && supabase) return supabase;
    if (window.supabase) return window.supabase.createClient('https://oprrfbsrihkjtiafyuxn.supabase.co', 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl');
    throw new Error('Supabase library not loaded. Disable adblockers.');
}

// Helper to ignore accents in search
function normalizeStr(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Helper to highlight matched text while preserving original accents
function highlightMatch(text, query) {
    const normText = normalizeStr(text);
    const normQuery = normalizeStr(query);
    const index = normText.indexOf(normQuery);
    if (index === -1) return text;
    
    return text.substring(0, index) + 
           '<span class="text-[#003DA5] bg-blue-50 px-0.5 rounded">' + 
           text.substring(index, index + query.length) + 
           '</span>' + 
           text.substring(index + query.length);
}

const LocationService = {
    // Force refresh cache if needed (e.g. if you add new locations in DB)
    clearCache() {
        localStorage.removeItem('nexus_locations');
    },

    // 1. Fetch Provinces
    async getProvinces() {
        return this.fetchFromSupabase('provinces', () => 
            getLocationsClient().from('locations').select('province').eq('is_active', true)
        );
    },

    // 2. Fetch Cantons based on a chosen Province
    async getCantons(province) {
        return this.fetchFromSupabase(`cantons_${province}`, () => 
            getLocationsClient().from('locations').select('canton').eq('province', province).eq('is_active', true)
        );
    },

    // 3. Fetch Districts based on Canton
    async getDistricts(canton) {
        return this.fetchFromSupabase(`districts_${canton}`, () => 
            getLocationsClient().from('locations').select('district').eq('canton', canton).eq('is_active', true)
        );
    },

    // 4. Fetch the entire flattened list (Only use if necessary for legacy UI compatibility)
    // This will format data the old way: "San José > Pérez Zeledón > San Isidro de El General"
    async getAllAsStrings() {
        return this.fetchFromSupabase('all_locations_formatted', async () => {
            const { data, error } = await getLocationsClient().from('locations').select('province, canton, district').eq('is_active', true);
            if (error) throw error;
            
            // Format to match your old array style
            return data.map(row => `${row.province} > ${row.canton} > ${row.district}`);
        });
    },

    // Internal Helper: Handles fetching and Caching logic
    async fetchFromSupabase(cacheKey, queryFn) {
        // Check cache first
        const cached = localStorage.getItem(`nexus_cache_${cacheKey}`);
        if (cached) {
            console.log(`Loaded ${cacheKey} from incredibly fast browser cache! ⚡`);
            return JSON.parse(cached);
        }

        // If not in cache, fetch from Supabase
        console.log(`Fetching ${cacheKey} from Database... 🔄`);
        const { data, error } = await queryFn();
        
        if (error) {
            console.error('Error fetching locations:', error);
            return [];
        }

        // Extract unique values if it's a specific column request (like just provinces)
        let results = data;
        if (data.length > 0 && typeof data[0] === 'object' && Object.keys(data[0]).length === 1) {
            const key = Object.keys(data[0])[0];
            results = [...new Set(data.map(item => item[key]))];
        }

        // Save to cache for next time
        localStorage.setItem(`nexus_cache_${cacheKey}`, JSON.stringify(results));
        return results;
    }
};

// Exposing backwards compatibility temporarily
// Previously this was a static file. Now, components need to await the data.
let LOCATION_DB = [];
// Automatically fetch on file load to populate global variable if older scripts rely on it
setTimeout(async () => {
    try {
        if (typeof supabase !== 'undefined') {
            LOCATION_DB = await LocationService.getAllAsStrings();
        }
    } catch(e) { console.error(e); }
}, 100);