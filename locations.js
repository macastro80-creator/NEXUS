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
        return this.fetchFromSupabase('all_locations_formatted_r3', async () => {
            const { data, error } = await getLocationsClient().from('locations').select('province, canton, district').eq('is_active', true);
            if (error) return { error };
            
            // Format to match your old array style
            const baseLocations = data.map(row => `${row.province} > ${row.canton} > ${row.district}`);
            
            // Inject Pérez Zeledón detailed neighborhoods as requested
            const pzData = {
                "San Isidro de El General": [
                    "Aeropuerto", "Alto Alonso", "Boruca", "Boston", "Cementerio", "Cooperativa", "Cristo Rey", "Doce de Marzo", "Dorotea", "Durán Picado", "España", "Estadio", "Evans Gordon Wilson", "González", "Hospital", "Hoyón", "I Griega", "La Lucha", "Las Américas", "Lomas de Cocorí", "Luis Monge", "Morazán", "Pavones", "Pedregoso", "Pocito", "Prado", "Romero", "Sagrada Familia", "San Andrés", "San Luis", "San Rafael Sur", "San Vicente", "Santa Cecilia", "Sinaí", "Tierra Prometida", "Tormenta", "Unesco", "Valverde",
                    "Alto Ceibo", "Alto Huacas", "Alto Sajaral", "Alto San Juan", "Alto Tumbas", "Angostura", "Bajo Ceibo", "Bajo Esperanzas", "Bajo Mora", "Bijaguales", "Bocana", "Bonita", "Ceibo", "Ceniza", "Dorado", "Esperanzas", "Guadalupe", "Guaria", "Higuerones", "Jilguero", "Jilguero Sur", "Los Guayabos", "María Auxiliadora", "Miravalles", "Morete", "Ojo de Agua", "Ocho de Diciembre", "Pacuarito", "Palma", "Paso Beita", "Paso Lagarto", "Quebrada Honda", "Quebrada Vueltas", "Quebradas", "Roble", "Rosario", "San Agustín", "San Jorge", "San Juan de Miramar", "San Lorenzo", "San Rafael Norte", "Santa Fe", "Santa Marta", "Suiza", "Tajo", "Toledo", "Tronconales", "Tuis", "Villanueva"
                ],
                "El General": [
                    "General Viejo", "Venecia", "Nuevo General", "Peñas Blancas", "El Ingenio", "Calle Hidalgo", "San Martín", "Pinar del Río", "Santa Elena", "Trinidad", "Las Nubes", "La Paz", "Barrio Nuevo", "Bajo Los Arias", "El Chumpulún", "Calle Guzmán", "Playa Verde", "La Linda", "El Carril", "Paraíso", "San Luis", "Miraflores", "Santa Cruz", "San Blas", "La Hermosa", "La Arepa", "Quizarrá", "Montecarlo", "Arepa", "Carmen", "Chanchos", "Hermosa", "Linda Arriba"
                ],
                "Daniel Flores": [
                    "Palmares", "Alto Brisas", "Los Ángeles", "Aurora", "Los Chiles", "Crematorio", "Daniel Flores Zavaleta", "Barrio Laboratorio", "Los Pinos", "Loma Verde", "Lourdes", "Rosas", "Rosa Iris", "San Francisco", "Santa Margarita", "La Trocha", "Villa Ligia", "Aguas Buenas", "Bajos de Pacuar", "Concepción", "Corazón de Jesús", "Juntas de Pacuar", "Paso Bote", "Patio de Agua", "Peje", "Percal", "Repunta", "Los Reyes", "La Ribera", "La Suiza"
                ],
                "Rivas": [
                    "San Gerardo", "Canaán", "Chimirol", "Herradura", "Los Ángeles", "Guadalupe", "San Francisco", "Talari", "San José", "Monterrey", "Calle Los Mora", "Zapotal", "Chispa", "Chuma", "Río Blanco", "Buena Vista", "La Piedra", "Palmital", "San Juan Norte", "Alaska", "Piedra Alta", "Alto Jaular", "San Cayetano", "Las Playas", "Rivas", "Pueblo Nuevo", "Miravalles", "La Bonita", "Linda Vista", "Tirrá", "La Bambú", "San Antonio", "Lourdes", "Santa Marta", "División", "El Jardín", "Villa Mills", "Macho Mora", "El Nivel-Siberia"
                ],
                "San Pedro": [
                    "Cruz Roja", "San Pedro", "Arenilla", "Alto Calderón", "Cedral", "Colonia", "Cristo Rey", "Esperanza", "Fátima", "Fortuna", "Guaria", "Los Ángeles", "Laguna", "Nueva Hortensia", "Nueva Santa Ana", "Rinconada Vega", "San Jerónimo", "San Juan", "San Juancito", "San Rafael", "Santa Ana", "Santa Cecilia", "Santo Domingo", "Santiago", "Tambor", "Unión", "Zapotal"
                ],
                "Platanares": [
                    "San Rafael", "Bajo Bonitas", "Bajo Espinoza", "Bolivia", "Bonitas", "Buenos Aires", "Cristo Rey", "La Sierra", "Lourdes", "Mastatal", "Mollejoncito", "Mollejones", "Naranjos", "San Pablito", "San Pablo", "Socorro", "Surtubal", "Villa Argentina", "Villa Flor", "Vista de Mar", "San Gerardo"
                ],
                "Pejibaye": [
                    "Achiotal", "Águila", "Alto Trinidad", "Bajo Caliente", "Bajo Minas", "Barrionuevo", "Bellavista", "Calientillo", "Delicias", "Desamparados", "El Progreso", "Gibre", "Guadalupe", "Las Cruces", "Mesas", "Minas", "Paraíso", "San Marcos", "San Martín", "San Miguel", "Santa Fe", "Trinidad", "Veracruz", "Zapote"
                ],
                "Cajon": [
                    "Cedral", "El Quemado", "Gloria", "Las Brisas", "Los Vega", "Mercedes", "Montecarlo", "Navajuelar", "Nubes", "Paraíso", "Pilar", "Pueblo Nuevo", "Quizarrá", "Salitrales", "San Francisco", "San Ignacio", "San Pedrito", "Santa María", "Santa Teresa"
                ],
                "BaRU": [
                    "Alfombra", "Alto Perla", "Bajos", "Bajos de Zapotal", "Barú", "Barucito", "Cacao", "Camarones", "Cañablanca", "Ceiba", "Chontales", "Farallas", "Florida", "San Juan de Dios", "Líbano", "Magnolia", "Pozos", "Reina", "San Marcos", "San Salvador", "Santa Juana", "Santo Cristo", "Tinamaste", "Torito", "Tres Piedras", "Tumbas", "Villabonita Vista Mar"
                ],
                "RIO NUEVO": [
                    "Santa Rosa", "San Antonio", "Calle Mora", "San Juan de la Cruz", "Santa Marta", "La Purruja", "San Cayetano", "Chirricano", "Savegre", "El Llano", "El Brujo", "Piedras Blancas", "Zaragoza", "Santa Lucía", "California"
                ],
                "PARAMO": [
                    "San Ramón Sur", "Alto Macho Mora", "Siberia", "División", "Miramar", "Jardín", "La Hortensia", "La Ese", "Matazanos", "Valencia", "San Ramón Norte", "Berlín", "Ángeles", "Santo Tomás", "Santa Eduviges", "San Miguel", "Pedregosito"
                ],
                "LA AMISTAD": [
                    "San Antonio", "Corralillo", "China Kicha", "Montezuma", "Oratorio", "San Carlos", "San Gabriel", "San Roque", "Santa Cecilia", "Santa Luisa"
                ]
            };

            const extraLocations = [];
            for (const [district, hoods] of Object.entries(pzData)) {
                for (const hood of hoods) {
                    extraLocations.push(`San José > Pérez Zeledón > ${district} > ${hood}`);
                }
            }

            return { data: [...baseLocations, ...extraLocations] };
        });
    },

    // Internal Helper: Handles fetching and Caching logic
    async fetchFromSupabase(cacheKey, queryFn) {
        // Check cache first
        const cached = localStorage.getItem(`nexus_cache_${cacheKey}`);
        if (cached) {
            const parsedCache = JSON.parse(cached);
            if (parsedCache && parsedCache.length > 0) {
                console.log(`Loaded ${cacheKey} from incredibly fast browser cache! ⚡`);
                return parsedCache;
            }
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

        // Save to cache for next time ONLY if we have data
        if (results && results.length > 0) {
            localStorage.setItem(`nexus_cache_${cacheKey}`, JSON.stringify(results));
        }
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