const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase
const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
});

/**
 * 1. Sync Agents (Members API)
 */
async function syncAgents() {
    console.log("▶ Iniciando Sincronización de Agentes...");
    try {
        const xmlData = fs.readFileSync('./mock_agents.xml', 'utf8');
        const jsonObj = parser.parse(xmlData);
        
        const members = jsonObj.ArrayOfMembersInRegion.MembersInRegion;
        const membersList = Array.isArray(members) ? members : [members];

        console.log(`Encontrados ${membersList.length} agentes en el XML.`);

        // Get RE/MAX Altitud office ID automatically
        const { data: officeData, error: officeErr } = await supabase
            .from('offices')
            .select('id')
            .ilike('name', '%Altitud%')
            .limit(1).single();

        let targetOfficeId = null;
        if (officeData) targetOfficeId = officeData.id;

        for (const m of membersList) {
            const roleStr = (m.Title && m.Title.toLowerCase() === 'owner') ? 'broker' : 'agent';
            
            // Upsert strategy using the unique email or looking up by AssociateID if exist
            // Currently profiles requires a UUID from auth.users. 
            // In a real scenario, we might just store these as "prospects" or use an Admin API to create Auth users.
            // For now, since this is a demonstration of the sync logic, we will assume we update existing profiles 
            // by matching emails, or we let them be if no auth user exists.
            console.log(`Procesando agente: ${m.FirstName} ${m.LastName} - ${m.RemaxEmail}`);
            
            // To be totally safe without using Service Role Key to bypass Auth, 
            // we will just print what we would do or find matching emails and update their demographics.
            const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', m.RemaxEmail).maybeSingle();
            
            if (existingUser) {
                await supabase.from('profiles').update({
                    full_name: `${m.FirstName} ${m.LastName}`,
                    gender: m.Gender === 'F' ? 'female' : 'male',
                    dob: m.Birthday,
                    start_date: m.StartDate,
                    avatar_url: m.UrlImg,
                    role: roleStr,
                    office_id: targetOfficeId
                }).eq('id', existingUser.id);
                console.log(`✅ Agente actualizado: ${m.FirstName}`);
            } else {
                console.log(`⏳ Pendiente de registro Auth: ${m.FirstName} (${m.RemaxEmail})`);
            }
        }
        console.log("✔ Sincronización de Agentes Completada.\n");
    } catch (error) {
        console.error("❌ Error sincronizando agentes:", error);
    }
}

/**
 * 2. Sync Properties (Properties API)
 */
async function syncProperties() {
    console.log("▶ Iniciando Sincronización de Propiedades...");
    try {
        const xmlData = fs.readFileSync('./mock_properties.xml', 'utf8');
        const jsonObj = parser.parse(xmlData);
        
        const props = jsonObj.ArrayOfPropertiesInRegion.PropertiesInRegion;
        const propsList = Array.isArray(props) ? props : [props];

        console.log(`Encontradas ${propsList.length} propiedades en el XML.`);

        // Get RE/MAX Altitud office ID automatically
        const { data: officeData } = await supabase
            .from('offices')
            .select('id')
            .ilike('name', '%Altitud%')
            .limit(1).single();

        let targetOfficeId = officeData ? officeData.id : null;

        for (const p of propsList) {
            // Mapping Type
            let mappedType = 'house';
            const rawType = p.PropertyTypeName_en ? p.PropertyTypeName_en.toLowerCase() : '';
            if (rawType.includes('lot') || rawType.includes('land')) mappedType = 'lot';
            if (rawType.includes('commercial')) mappedType = 'commercial';

            // Mapping Status
            let mappedStatus = 'for_sale';
            const rawStatus = p.Status ? p.Status.toLowerCase() : '';
            if (rawStatus.includes('sold')) mappedStatus = 'sold';
            else if (rawStatus.includes('rent')) mappedStatus = 'for_rent';
            
            // Match Agent ID (AssociateId) - requires linking against real emails eventually. 
            // For now, we will leave agent_id null or map to an admin user since we lack full agent auth records.

            const propObj = {
                office_id: targetOfficeId,
                external_api_id: p.ListingKey.toString(),
                title: p.ListingTitle_es || p.ListingTitle_en || 'Sin Título',
                prop_type: mappedType,
                status: mappedStatus,
                is_exclusive: p.Listingagreementyn === 'Y',
                capture_date: p.ListingContractDate,
                price: parseFloat(p.ListPrice),
                currency: 'USD',
                location: p.Location,
                metrics: {
                    bedrooms: p.BedroomsTotal,
                    bathrooms: p.BathroomsFull,
                    lot_size: p.LotSizeArea
                }
            };
            
            console.log(`Insertando/Actualizando: ${propObj.title} ($${propObj.price})`);
            const { error: upsertErr } = await supabase.from('properties').upsert(propObj, { onConflict: 'external_api_id' });
            if (upsertErr) {
                console.error(`❌ Error con propiedad ${propObj.external_api_id}:`, upsertErr);
            } else {
                console.log(`✅ Propiedad guardada.`);
            }
        }
        console.log("✔ Sincronización de Propiedades Completada.\n");
    } catch (error) {
        console.error("❌ Error sincronizando propiedades:", error);
    }
}

async function runSync() {
    await syncAgents();
    await syncProperties();
    console.log("🚀 Sincronización Global Completada. Puedes revisar la API.");
}

runSync();
