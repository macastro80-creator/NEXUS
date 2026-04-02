/**
 * NEXUS — Supabase Client
 * ========================
 * This file initializes the Supabase client and exports helper functions
 * for authentication and data operations.
 *
 * SETUP: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values.
 * Find these in: Supabase Dashboard → Settings → API
 */

// ============================================
// CONFIG — Replace these with your project values
// ============================================
const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';

// Initialize Supabase client globally without destroying the original library
if (window.supabase && typeof window.supabase.createClient === 'function' && !window.supabaseInstance) {
    window.supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
var supabase = window.supabaseInstance || null;

if (!supabase) {
    console.warn('⚠️ Supabase SDK not loaded. Make sure to include the script tag in your HTML.');
    alert("CRITICAL ERROR: Supabase CDN blocked by your browser/network! Match Board will crash. Please disable adblockers or check your connection.");
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Sign up a new user with email and password
 */
async function signUp(email, password, fullName, phone, brand) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { 
                full_name: fullName,
                phone: phone,
                brand: brand
            }
        }
    });
    if (error) throw error;
    return data;
}

/**
 * Sign in with email and password
 */
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

/**
 * Sign out the current user
 */
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear any remaining localStorage items
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isPremium');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
}

/**
 * Get the currently logged-in user
 */
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get the current user's profile from the profiles table
 */
async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*, offices!office_id(name, brand, area)')
        .eq('id', user.id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

/**
 * Send password reset email
 */
async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login.html'
    });
    if (error) throw error;
}

/**
 * Listen for auth state changes (login, logout, token refresh)
 */
function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Update the current user's profile
 */
async function updateProfile(updates) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Upload avatar image
 */
async function uploadAvatar(file) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not logged in');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    // Save URL to profile
    await updateProfile({ avatar_url: publicUrl });
    return publicUrl;
}

// ============================================
// SEARCH FUNCTIONS (Match Board)
// ============================================

/**
 * Get all active searches for the Match Board
 * Excludes the current user's own searches
 */
async function getActiveSearches() {
    const user = await getCurrentUser();

    let query = supabase
        .from('searches')
        .select('*, profiles!agent_id(full_name, brand, avatar_url, phone)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    // Exclude own searches so you don't see your own on the board
    if (user) {
        query = query.neq('agent_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Get the current user's searches
 */
async function getMySearches() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('searches')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Create a new search
 */
async function createSearch(searchData) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
        .from('searches')
        .insert({
            ...searchData,
            agent_id: user.id,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a search status (pause, archive, renew)
 */
async function updateSearch(searchId, updates) {
    const { data, error } = await supabase
        .from('searches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', searchId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// MATCH FUNCTIONS
// ============================================

/**
 * Send a match (property) to a search
 */
async function sendMatch(matchData) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not logged in');

    const { data, error } = await supabase
        .from('matches')
        .insert({
            ...matchData,
            sender_id: user.id
        })
        .select()
        .single();

    if (error) throw error;

    // Create notification for the search owner
    const search = await supabase
        .from('searches')
        .select('agent_id, client_name')
        .eq('id', matchData.search_id)
        .single();

    if (search.data) {
        await createNotification(search.data.agent_id, {
            type: 'new_match',
            title: 'New Match Received!',
            body: `A new property match was sent for ${search.data.client_name}`,
            link: '/my-desk.html'
        });
    }

    return data;
}

/**
 * Get matches for a specific search
 */
async function getMatchesForSearch(searchId) {
    const { data, error } = await supabase
        .from('matches')
        .select('*, profiles!sender_id(full_name, brand, avatar_url, phone)')
        .eq('search_id', searchId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get matches sent by the current user
 */
async function getMyMatchesSent() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('matches')
        .select('*, searches(client_name, agent_id, location, profiles!agent_id(full_name, brand))')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Update match status (liked, visited, rejected, etc.)
 */
async function updateMatchStatus(matchId, actionStr, rejectReason) {
    const user = await getCurrentUser();
    // If no user, fallback to simple update
    if (!user) {
        const updates = { status: actionStr, updated_at: new Date().toISOString() };
        if (rejectReason) updates.reject_reason = rejectReason;
        const { data, error } = await supabase.from('matches').update(updates).eq('id', matchId).select().single();
        if (error) throw error;
        return data;
    }

    // 1. Fetch match and search
    const { data: match, error: fetchErr } = await supabase
        .from('matches')
        .select(`*, searches(co_buyer_id)`)
        .eq('id', matchId)
        .single();
    if (fetchErr) throw fetchErr;

    let { liked_by, rejected_by, status } = match;
    liked_by = liked_by || [];
    rejected_by = rejected_by || [];
    
    if (actionStr === 'liked' && !liked_by.includes(user.id)) liked_by.push(user.id);
    if (actionStr === 'rejected' && !rejected_by.includes(user.id)) rejected_by.push(user.id);
    
    // 3. Determine new status
    if (rejected_by.length > 0) {
        status = 'rejected';
    } else if (liked_by.length > 0) {
        const hasCoBuyer = match.searches && match.searches.co_buyer_id;
        if (hasCoBuyer) {
            if (liked_by.length >= 2) {
                status = 'liked'; // Both liked
            } else {
                status = 'waiting_partner';
            }
        } else {
            status = 'liked';
        }
    }

    const updates = {
        status,
        liked_by,
        rejected_by,
        updated_at: new Date().toISOString()
    };
    if (rejectReason) updates.reject_reason = rejectReason;

    const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', matchId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// TICKET FUNCTIONS
// ============================================

/**
 * Create a support ticket
 */
async function createTicket(ticketData) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from('tickets')
        .insert({
            ...ticketData,
            user_id: user ? user.id : null,
            user_email: user ? user.email : ticketData.user_email || '',
            user_name: ticketData.user_name || ''
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all tickets (admin only)
 */
async function getAllTickets() {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Update ticket status
 */
async function updateTicketStatus(ticketId, status) {
    const { data, error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', ticketId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// OFFICE FUNCTIONS
// ============================================

/**
 * Get all offices
 */
async function getAllOffices() {
    const { data, error } = await supabase
        .from('offices')
        .select(`
            *,
            profiles!office_id(id, full_name, role, brand)
        `)
        .order('created_at', { ascending: true });

    if (error) throw error;

    // Enrich with agent/team counts
    return data.map(office => ({
        ...office,
        teamCount: (office.profiles || []).filter(p => p.role === 'team_leader').length,
        agentCount: (office.profiles || []).filter(p => ['agent', 'remax'].includes(p.role)).length
    }));
}

/**
 * Create an office (admin only)
 */
async function createOffice(officeData) {
    const { data, error } = await supabase
        .from('offices')
        .insert(officeData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete an office (admin only)
 */
async function deleteOffice(officeId) {
    const { error } = await supabase
        .from('offices')
        .delete()
        .eq('id', officeId);

    if (error) throw error;
}

// ============================================
// LOCATION FUNCTIONS
// ============================================

/**
 * Get all active locations
 */
async function getActiveLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('canton', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Get locations grouped by canton
 */
async function getLocationsByCanton() {
    const locations = await getActiveLocations();
    const grouped = {};
    locations.forEach(loc => {
        if (!grouped[loc.canton]) {
            grouped[loc.canton] = { province: loc.province, districts: [] };
        }
        grouped[loc.canton].districts.push(loc.district);
    });
    return grouped;
}

// ============================================
// DEAL FUNCTIONS
// ============================================

/**
 * Get the current user's deals
 */
async function getMyDeals() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('deals')
        .select('*, searches(client_name), matches(property_name)')
        .or(`buyer_agent_id.eq.${user.id},seller_agent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Create a deal
 */
async function createDeal(dealData) {
    const { data, error } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update deal stage
 */
async function updateDealStage(dealId, stage, notes) {
    const updates = { stage, updated_at: new Date().toISOString() };
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', dealId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Create a notification for a user
 */
async function createNotification(userId, notifData) {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            ...notifData
        });

    if (error) console.error('Failed to create notification:', error);
}

/**
 * Get unread notifications for the current user
 */
async function getUnreadNotifications() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Mark a notification as read
 */
async function markNotificationRead(notifId) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId);

    if (error) throw error;
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead() {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) throw error;
}

// ============================================
// ADMIN / DASHBOARD FUNCTIONS
// ============================================

/**
 * Get KPI stats for the admin dashboard
 */
async function getAdminKPIs() {
    const [officesRes, profilesRes] = await Promise.all([
        supabase.from('offices').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id, role, brand')
    ]);

    const profiles = profilesRes.data || [];

    return {
        totalOffices: officesRes.count || 0,
        totalTeams: profiles.filter(p => p.role === 'team_leader').length,
        remaxAgents: profiles.filter(p => p.brand === 'REMAX' && p.role !== 'buyer').length,
        externalAgents: profiles.filter(p => p.brand !== 'REMAX' && p.role !== 'buyer' && p.role !== 'mainadmin').length,
        totalBuyers: profiles.filter(p => p.role === 'buyer').length
    };
}

/**
 * Get all agents (admin view)
 */
async function getAllAgents() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get all searches (admin view)
 */
async function getAllSearchesAdmin() {
    const { data, error } = await supabase
        .from('searches')
        .select('*, profiles!agent_id(full_name, brand)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Delete a search (admin only)
 */
async function deleteSearchAdmin(searchId) {
    const { error } = await supabase
        .from('searches')
        .delete()
        .eq('id', searchId);

    if (error) throw error;
}

/**
 * Delete a user completely (admin only via RPC)
 */
async function deleteUserAdmin(userId) {
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
    if (error) throw error;
}

/**
 * Block a user (admin only via RPC)
 */
async function toggleUserBlockAdmin(userId, block) {
    const status = block ? 'blocked' : 'agent';
    const { error } = await supabase.rpc('admin_toggle_user_block', { target_user_id: userId, new_role: status });
    if (error) throw error;
}

// ============================================
// AGENT / LEAD PROTECTION FUNCTIONS
// ============================================

async function validateAndPreRegisterClient({name, email, phone}) {
    const user = await getCurrentUser();
    if (!user) return { error: "Agent not logged in." };

    try {
        const dummyPassword = 'NexusPreReg!123';
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: dummyPassword,
            options: { data: { full_name: name } }
        });
        
        if (authError) {
            if (authError.message.includes('already registered')) {
                return { error: "This email is already registered in NEXUS. They might be working with another agent." };
            }
            return { error: authError.message };
        }
        
        const clientId = authData.user.id;
        
        // Update profile role and assign agent
        await supabase.from('profiles').update({
            role: 'buyer',
            phone: phone,
            assigned_agent_id: user.id
        }).eq('id', clientId);
        
        // Create an empty "pending_onboarding" search so the agent sees the lead in the dashboard
        const { data: searchData, error: searchError } = await supabase.from('searches').insert({
            agent_id: user.id,
            client_name: name,
            search_type: 'buy',
            status: 'pending_onboarding',
            notes: `Phone: ${phone} | Email: ${email}`
        }).select().single();
        
        if (searchError) throw searchError;
        
        return { clientId: clientId, searchId: searchData.id };
        
    } catch(err) {
        return { error: err.message };
    }
}

// ============================================
// BUYER FUNCTIONS (buyer role users)
// ============================================

/**
 * Get properties matched for a buyer (by their assigned agent)
 */
async function getBuyerMatches(buyerId) {
    // Find matches where this buyer is either the primary buyer, partner, or co-buyer
    const { data, error } = await supabase
        .from('matches')
        .select('*, searches!inner(client_name, agent_id, buyer_id, partner_id, co_buyer_id)')
        .or(`buyer_id.eq.${buyerId},partner_id.eq.${buyerId},co_buyer_id.eq.${buyerId}`, { foreignTable: 'searches' })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}




// ============================================
// UTILITY: Check if Supabase is configured
// ============================================
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// Global Auth Guard
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    if (path.includes('login') || path.includes('client-onboarding') || path.includes('test_credentials')) {
        return;
    }

    if (isSupabaseConfigured() && supabase) {
        try {
            const user = await getCurrentUser();
            if (!user) {
                console.error("AuthGuard: getCurrentUser() returned null.");
                window.location.href = 'login.html';
                return;
            }
            // Check if blocked
            const profile = await getCurrentProfile();
            if (profile && profile.role === 'blocked') {
                await signOut();
                alert('Your account has been deactivated by the administrator.');
                window.location.href = 'login.html';
                return;
            }

            // Enforce Profile Completion
            let isComplete = false;
                        if (profile) {
                            const checkComplete = (val) => {
                                if (!val) return false;
                                if (Array.isArray(val)) return val.length > 0 && val[0] !== "" && val[0] !== null;
                                if (typeof val === 'string') {
                                    const str = val.trim().replace(/"/g, '').replace(/'/g, '');
                                    return str.length > 0 && str !== "{}" && str !== "[]" && str !== "null" && str !== "undefined" && str !== "[null]";
                                }
                                return false;
                            };
                            
                            isComplete = checkComplete(profile.expert_zones) || checkComplete(profile.specializations);
                        }
            
            if (!isComplete && !path.includes('profile')) {
                const hash = window.location.hash || '';
                console.log("DB-SERVICE: Redirecting to profile. html. hash=", hash);
                window.location.href = 'profile.html?onboarding=true' + hash;
                return;
            } else {
                console.log("DB-SERVICE: Passed guard. isComplete=", isComplete, " path=", path, " profile=", profile ? JSON.stringify(profile.expert_zones) : 'null');
                if (path === '/' || path.includes('app.html')) {
                    alert("DEBUG INFO: Guard evaluado. isComplete=" + isComplete + ". Zonas: " + (profile ? JSON.stringify(profile.expert_zones) : 'null'));
                }
            }

            // --- PREMIUM UX GATING (BMAD METHOD) ---
            const isPremiumUser = profile && ['remax', 'teamleader', 'broker', 'officeadmin', 'mainadmin'].includes(profile.role);
            
            // Only lock if NOT premium and NOT already on the upgrade page
            if (!isPremiumUser && !path.includes('premium-upgrade.html')) {
                const premiumElements = [
                    document.getElementById('nav-office'),
                    document.getElementById('nav-resources'),
                    document.getElementById('nav-business'),
                    ...Array.from(document.querySelectorAll('.premium-only')),
                    ...Array.from(document.querySelectorAll('a[href="Mi_Oficina.html"]')),
                    ...Array.from(document.querySelectorAll('a[href="market.html"]')),
                    ...Array.from(document.querySelectorAll('button[onclick*="invite-client"]'))
                ];
                
                premiumElements.filter(Boolean).forEach(el => {
                    if (el && (el.tagName === 'A' || el.tagName === 'BUTTON' || (el.tagName === 'DIV' && el.getAttribute('onclick')))) {
                        el.classList.add('premium-locked', 'relative', 'group');
                        
                        // Add lock icon styling
                        if (!el.innerHTML.includes('fa-lock')) {
                            el.insertAdjacentHTML('beforeend', '<div class="absolute -top-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)] z-20 group-hover:scale-110 transition-transform cursor-pointer"><i class="fa-solid fa-lock text-[8px] text-slate-900"></i></div>');
                        }

                        // Remove existing navigation actions
                        if (el.tagName === 'A') el.removeAttribute('href');
                        if (el.hasAttribute('onclick')) el.removeAttribute('onclick');
                        
                        // Override click to trigger premium upsell bounce
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = 'premium-upgrade.html';
                        });
                    }
                });
            }

        } catch (e) {
            console.error("AuthGuard Exception:", e);
            window.location.href = 'login.html';
        }
    } else if (!localStorage.getItem('userEmail')) {
        console.warn("AuthGuard: supabase not initialized and no userEmail in localStorage.");
        window.location.href = 'login.html';
    }
});

// Export availability check
console.log(isSupabaseConfigured()
    ? '✅ Supabase client initialized and global auth guard active'
    : '⚠️ Supabase not configured. Replace URL and KEY in supabase-client.js'
);
