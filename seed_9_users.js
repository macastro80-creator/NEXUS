const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';

// Use a single supabase instance to sign them up sequentially
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USERS_TO_SEED = [
    { email: 'therobertblank@gmail.com', name: 'Robert Blank', brand: 'Independent', role: 'agent' },
    { email: 'cesar@remax-altitud.cr', name: 'Cesar Negrette', brand: 'REMAX', role: 'remax' },
    { email: 'acastro@remax-altitud.cr', name: 'Alejandra Castro', brand: 'REMAX', role: 'broker' },
    { email: 'alejandra@ecolifestylerealty.com', name: 'Hannah Fletcher', brand: 'REMAX', role: 'regional_director' },
    { email: 'hello@yourhomeincostarica.com', name: 'AC Admin', brand: 'NEXUS', role: 'mainadmin' },
    { email: 'macastro80@gmail.com', name: 'Macastro', brand: 'Independent', role: 'buyer' },
    { email: 'cfnegrette@gmail.com', name: 'Fernando N', brand: 'Independent', role: 'buyer' },
    { email: 'carloschinchilla7@gmail.com', name: 'Carlos Chinchilla', brand: 'REMAX', role: 'team_leader' },
    { email: 'hola@remax-altitud.cr', name: 'Remax Altitud Admin', brand: 'REMAX', role: 'officeadmin' }
];

const DEFAULT_PASSWORD = 'NexusTest2026!';

async function seedData() {
    console.log('🔄 Iniciando creación de los 9 usuarios de prueba en NEXUS...');
    
    for (const u of USERS_TO_SEED) {
        console.log(`\nCreando usuario: ${u.name} (${u.email}) [Rol: ${u.role}]`);
        // 1. Sign Up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: DEFAULT_PASSWORD,
            options: {
                data: {
                    full_name: u.name,
                    brand: u.brand
                }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`   🔸 El correo ${u.email} ya existe en Supabase. Intentando actualizar su rol mediante Login...`);
                // If it already exists, log in to update the profile securely
                const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
                    email: u.email,
                    password: DEFAULT_PASSWORD
                });

                if (loginErr) {
                    console.error(`   ❌ No se pudo iniciar sesión con ${u.email} para actualizarlo. Razón: ${loginErr.message}`);
                    continue;
                }
            } else {
                console.error(`   ❌ Falló el registro de ${u.email}:`, authError.message);
                continue;
            }
        } else {
            console.log(`   ✅ Cuenta creada para ${u.email} en auth.users`);
        }

        // Now the user is logged in (either via signUp or signIn), get their ID
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        
        if (userErr || !user) {
            console.error(`   ❌ No se pudo obtener la sesión activa para actualizar el perfil.`);
            continue;
        }

        // 2. Update their profile with the assigned role
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                role: u.role,
                brand: u.brand
            })
            .eq('id', user.id);

        if (profileError) {
            console.error(`   ❌ Falló la actualización del perfil para asignar el rol '${u.role}':`, profileError.message);
        } else {
            console.log(`   ✅ Rol '${u.role}' y Marca '${u.brand}' asignados correctamente en /profiles`);
        }

        // Sign out to clear the session for the next user
        await supabase.auth.signOut();
    }

    console.log('\n✅ Proceso de actualización completado. Usa la clave "NexusTest2026!" para entrar con cualquiera de ellos.');
}

seedData();
