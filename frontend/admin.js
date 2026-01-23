// Admin Panel Script
const API_BASE_URL = window.API_BASE_URL || 'https://meetcodeai-x3kr.onrender.com/api';

// Auth Manager 
const AuthManager = {
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    getUser() {
        const user = localStorage.getItem('authUser');
        return user ? JSON.parse(user) : null;
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    // Redirect to home if not authenticated or not admin
    if (!AuthManager.isAuthenticated() || !AuthManager.isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    initAdmin();
});

function initAdmin() {
    loadDashboard();
    setupTabNavigation();
    loadAdminSettings();
}

function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tab = link.getAttribute('data-tab');
            if (!tab) return;
            
            e.preventDefault();
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update active tab
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const tabElement = document.getElementById(tab);
            if (tabElement) {
                tabElement.classList.add('active');
                document.getElementById('page-title').textContent = link.textContent.trim();
            }
            
            // Load tab-specific data
            if (tab === 'quotes') loadAllQuotes();
            if (tab === 'contacts') loadAllContacts();
            if (tab === 'clients') loadAllClients();
        });
    });
}

// API helper with JWT
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = AuthManager.getToken();
    
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            window.location.href = 'index.html';
            return null;
        }

        const result = await response.json();
        return response.ok ? result : { error: result.message };
    } catch (error) {
        console.error('API error:', error);
        return { error: 'Network error' };
    }
}

// Load dashboard stats
async function loadDashboard() {
    // Load quotes
    const quotesRes = await apiCall('/quotes?limit=10');
    if (quotesRes && quotesRes.data) {
        displayQuotes(quotesRes.data.quotes || quotesRes.data);
    }

    // Load contacts
    const contactsRes = await apiCall('/contacts?limit=10');
    if (contactsRes && contactsRes.data) {
        displayContacts(contactsRes.data.contacts || contactsRes.data);
    }

    // Load user info
    const user = AuthManager.getUser();
    if (user && document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = user.name || user.email;
    }

    if (document.getElementById('last-updated')) {
        document.getElementById('last-updated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
}

// Display quotes table
function displayQuotes(quotes) {
    const tbody = document.getElementById('quotes-table-body');
    if (!tbody) return;

    tbody.innerHTML = quotes.map(quote => `
        <tr data-quote-id="${quote._id}">
            <td>${quote.name}</td>
            <td>${quote.agencyName}</td>
            <td>${quote.email}</td>
            <td>${quote.services.join(', ')}</td>
            <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="editQuote('${quote._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuote('${quote._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Display contacts table
function displayContacts(contacts) {
    const tbody = document.getElementById('contacts-table-body');
    if (!tbody) return;

    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.subject}</td>
            <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
            <td>
                <button class="btn btn-sm" onclick="viewContact('${contact._id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Edit quote
async function editQuote(id) {
    const status = prompt('Enter new status (pending/contacted/quoted/accepted/rejected):');
    if (!status) return;

    const quoteAmount = prompt('Enter quote amount (optional):');
    const data = { status };
    if (quoteAmount) data.quoteAmount = parseFloat(quoteAmount);

    const res = await apiCall(`/quotes/${id}`, 'PATCH', data);
    if (res && !res.error) {
        alert('Quote updated successfully');
        loadDashboard();
    } else {
        alert('Error updating quote: ' + (res?.error || 'Unknown error'));
    }
}

// Delete quote
async function deleteQuote(id) {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    const res = await apiCall(`/quotes/${id}`, 'DELETE');
    if (res && !res.error) {
        alert('Quote deleted successfully');
        // Remove the row from the DOM
        const row = document.querySelector(`tr[data-quote-id="${id}"]`);
        if (row) {
            row.remove();
        }
        // Update stats
        loadDashboard();
    } else {
        alert('Error deleting quote');
    }
}

// View contact details
async function viewContact(id) {
    const res = await apiCall(`/contacts/${id}`);
    if (res && res.data) {
        const contact = res.data.contact;
        alert(`Name: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage: ${contact.message}\nStatus: ${contact.status}`);
    }
}

// Delete contact
async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    const res = await apiCall(`/contacts/${id}`, 'DELETE');
    if (res && !res.error) {
        alert('Contact deleted successfully');
        loadDashboard();
    } else {
        alert('Error deleting contact');
    }
}

// Logout
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = 'index.html';
}

// Load admin settings
function loadAdminSettings() {
    const user = AuthManager.getUser();
    if (user) {
        const emailEl = document.getElementById('admin-email');
        const nameEl = document.getElementById('admin-name');
        if (emailEl) emailEl.value = user.email || '';
        if (nameEl) nameEl.value = user.name || '';
    }
}

// Update settings
async function updateSettings() {
    const currentUser = AuthManager.getUser();
    const newEmail = document.getElementById('admin-email').value.trim();
    const newName = document.getElementById('admin-name').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Only check for changes, not for empty values
    const emailChanged = newEmail && newEmail !== (currentUser?.email || '');
    const nameChanged = newName && newName !== (currentUser?.name || '');
    const passwordChanged = newPassword && newPassword.trim();
    
    if (!emailChanged && !nameChanged && !passwordChanged) {
        alert('No changes to save');
        return;
    }
    
    const updates = {};
    if (emailChanged) updates.email = newEmail;
    if (nameChanged) updates.name = newName;
    if (passwordChanged) updates.password = newPassword;
    
    console.log('Sending updates:', JSON.stringify(updates, null, 2));
    console.log('Email value:', newEmail);
    console.log('Email changed:', emailChanged, 'Name changed:', nameChanged, 'Password changed:', passwordChanged);
    
    const res = await apiCall('/auth/update-profile', 'POST', updates);
    if (res && !res.error) {
        alert('Settings updated successfully');
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        // Reload admin data
        loadDashboard();
    } else {
        alert('Error updating settings: ' + (res?.error || res?.message || 'Unknown error'));
        console.error('Settings update error:', res);
    }
}

// Load all quotes
async function loadAllQuotes() {
    const res = await apiCall('/quotes?limit=100');
    if (res && res.data) {
        const quotes = res.data.quotes || res.data;
        const tbody = document.getElementById('all-quotes-table');
        tbody.innerHTML = quotes.map(quote => `
            <tr data-quote-id="${quote._id}">
                <td>${quote.name}</td>
                <td>${quote.agencyName}</td>
                <td>${quote.email}</td>
                <td>${quote.budget || 'N/A'}</td>
                <td>${Array.isArray(quote.services) ? quote.services.join(', ') : quote.services}</td>
                <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
                <td>${new Date(quote.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm" onclick="editQuote('${quote._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteQuote('${quote._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// Load all contacts
async function loadAllContacts() {
    const res = await apiCall('/contacts?limit=100');
    if (res && res.data) {
        const contacts = res.data.contacts || res.data;
        const tbody = document.getElementById('all-contacts-table');
        tbody.innerHTML = contacts.map(contact => `
            <tr>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.subject}</td>
                <td>${(contact.message || '').substring(0, 50)}...</td>
                <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
                <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm" onclick="viewContact('${contact._id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// Load all clients
async function loadAllClients() {
    const res = await apiCall('/quotes?limit=100');
    if (res && res.data) {
        const quotes = res.data.quotes || res.data;
        
        // Group by agency
        const clients = {};
        quotes.forEach(quote => {
            if (!clients[quote.agencyName]) {
                clients[quote.agencyName] = {
                    agencyName: quote.agencyName,
                    contactPerson: quote.name,
                    email: quote.email,
                    projects: 0,
                    totalSpent: 0,
                    lastContact: quote.createdAt
                };
            }
            clients[quote.agencyName].projects++;
            clients[quote.agencyName].totalSpent += quote.quoteAmount || 0;
            if (new Date(quote.createdAt) > new Date(clients[quote.agencyName].lastContact)) {
                clients[quote.agencyName].lastContact = quote.createdAt;
            }
        });
        
        const tbody = document.getElementById('clients-table');
        tbody.innerHTML = Object.values(clients).map(client => `
            <tr>
                <td>${client.agencyName}</td>
                <td>${client.contactPerson}</td>
                <td>${client.email}</td>
                <td>${client.projects}</td>
                <td>$${client.totalSpent.toLocaleString()}</td>
                <td>${new Date(client.lastContact).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm" onclick="contactClient('${client.email}')">Contact</button>
                </td>
            </tr>
        `).join('');
    }
}

// Refresh functions
function refreshQuotes() {
    loadAllQuotes();
}

function refreshContacts() {
    loadAllContacts();
}

function refreshClients() {
    loadAllClients();
}

// Export functions
function exportQuotes() {
    alert('Export feature coming soon. You can manually export from the data above.');
}

function exportContacts() {
    alert('Export feature coming soon. You can manually export from the data above.');
}

function exportClients() {
    alert('Export feature coming soon. You can manually export from the data above.');
}

// Contact client
function contactClient(email) {
    alert('Email: ' + email + '\nYou can contact this client directly.');
}
