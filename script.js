// APIs
const tcpaApi = "https://api.uspeoplesearch.net/tcpa/v1?x=";
const personApi = "https://api.uspeoplesearch.net/person/v3?x=";
const premiumLookupApi = "https://premium_lookup-1-h4761841.deta.app/person?x=";
const reportApi = "https://api.uspeoplesearch.net/tcpa/report?x=";

// DOM Elements
const phoneInput = document.getElementById('phoneInput');
const searchBtn = document.getElementById('searchBtn');
const phoneNumber = document.getElementById('phoneNumber');
const phoneState = document.getElementById('phoneState');
const dncNational = document.getElementById('dncNational');
const dncState = document.getElementById('dncState');
const litigator = document.getElementById('litigator');
const blacklist = document.getElementById('blacklist');
const ownersContainer = document.getElementById('ownersContainer');
const recentList = document.getElementById('recentList');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const themeBtn = document.getElementById('themeBtn');

// Recent searches array
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Initialize the app
function init() {
    updateRecentSearches();
    loadThemePreference();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    copyBtn.addEventListener('click', copyResults);
    shareBtn.addEventListener('click', shareResults);
    themeBtn.addEventListener('click', toggleTheme);
}

// Handle search
async function handleSearch() {
    const phone = phoneInput.value.trim();
    
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        alert('Please enter a valid 10-digit US phone number');
        return;
    }
    
    try {
        // Show loading state
        searchBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Searching...';
        searchBtn.disabled = true;
        
        // Clear previous results
        clearResults();
        
        // Fetch TCPA data
        const tcpaData = await fetchData(tcpaApi + phone);
        updatePhoneInfo(phone, tcpaData);
        
        // Fetch person data
        const personData = await fetchData(personApi + phone);
        updateOwnerInfo(personData);
        
        // Add to recent searches
        addToRecentSearches(phone);
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data. Please try again.');
    } finally {
        // Reset search button
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
        searchBtn.disabled = false;
    }
}

// Fetch data from API
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
}

// Update phone information
function updatePhoneInfo(phone, data) {
    phoneNumber.textContent = formatPhoneNumber(phone);
    phoneState.textContent = data.state || '-';
    
    // Update DNC status with proper styling
    updateStatusField(dncNational, data.dncNational);
    updateStatusField(dncState, data.dncState);
    updateStatusField(litigator, data.litigator);
    updateStatusField(blacklist, data.blacklist);
}

// Update status field with appropriate styling
function updateStatusField(element, value) {
    if (value === undefined || value === null || value === 'Not Available') {
        element.textContent = 'Not Available';
        element.className = 'status-unknown';
    } else if (value === true || value === 'Yes') {
        element.textContent = 'Yes';
        element.className = 'status-yes';
    } else {
        element.textContent = 'No';
        element.className = 'status-no';
    }
}

// Update owner information
function updateOwnerInfo(data) {
    if (!data || !data.owners || data.owners.length === 0) {
        ownersContainer.innerHTML = '<p>No owner information found for this number.</p>';
        return;
    }
    
    ownersContainer.innerHTML = '';
    
    data.owners.forEach(owner => {
        const ownerCard = document.createElement('div');
        ownerCard.className = 'owner-card';
        
        let html = `
            <h3>${owner.name || 'Unknown'}</h3>
            <div class="owner-details">
                <p><strong>Age:</strong> ${owner.age || 'Unknown'}</p>
            </div>
        `;
        
        if (owner.addresses && owner.addresses.length > 0) {
            html += `<div class="owner-addresses">
                <h4>Addresses:</h4>
                <table class="address-table">
                    <thead>
                        <tr>
                            <th>Address</th>
                            <th>City</th>
                            <th>State</th>
                            <th>ZIP</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            owner.addresses.forEach(addr => {
                html += `
                    <tr>
                        <td>${addr.address || '-'}</td>
                        <td>${addr.city || '-'}</td>
                        <td>${addr.state || '-'}</td>
                        <td>${addr.zip || '-'}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table></div>`;
        }
        
        if (owner.related && owner.related.length > 0) {
            html += `<div class="related-persons">
                <h4>Related Persons:</h4>
                <p>${owner.related.join(', ')}</p>
            </div>`;
        }
        
        ownerCard.innerHTML = html;
        ownersContainer.appendChild(ownerCard);
    });
}

// Clear results
function clearResults() {
    phoneNumber.textContent = '-';
    phoneState.textContent = '-';
    dncNational.textContent = '-';
    dncState.textContent = '-';
    litigator.textContent = '-';
    blacklist.textContent = '-';
    dncNational.className = '';
    dncState.className = '';
    litigator.className = '';
    blacklist.className = '';
    ownersContainer.innerHTML = '<p>No owner information available. Enter a phone number to search.</p>';
}

// Format phone number
function formatPhoneNumber(phone) {
    return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
}

// Add to recent searches
function addToRecentSearches(phone) {
    // Remove if already exists
    recentSearches = recentSearches.filter(p => p !== phone);
    
    // Add to beginning
    recentSearches.unshift(phone);
    
    // Keep only last 5 searches
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // Update UI
    updateRecentSearches();
}

// Update recent searches list
function updateRecentSearches() {
    recentList.innerHTML = '';
    
    if (recentSearches.length === 0) {
        recentList.innerHTML = '<li>No recent searches</li>';
        return;
    }
    
    recentSearches.forEach(phone => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${formatPhoneNumber(phone)}</span>
            <button class="recent-search-btn" data-phone="${phone}">
                <i class="fas fa-search"></i>
            </button>
        `;
        recentList.appendChild(li);
    });
    
    // Add event listeners to recent search buttons
    document.querySelectorAll('.recent-search-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            phoneInput.value = e.target.closest('button').dataset.phone;
            handleSearch();
        });
    });
}

// Copy results to clipboard
function copyResults() {
    const phoneInfo = `
Phone Number: ${phoneNumber.textContent}
State: ${phoneState.textContent}
DNC National: ${dncNational.textContent}
DNC State: ${dncState.textContent}
Litigator: ${litigator.textContent}
Blacklist: ${blacklist.textContent}
    `;
    
    let ownerInfo = '\nOwner Information:\n';
    const ownerCards = ownersContainer.querySelectorAll('.owner-card');
    
    if (ownerCards.length === 0) {
        ownerInfo += 'No owner information available';
    } else {
        ownerCards.forEach(card => {
            ownerInfo += `\nName: ${card.querySelector('h3').textContent}\n`;
            
            const details = card.querySelectorAll('.owner-details p');
            details.forEach(detail => {
                ownerInfo += `${detail.textContent}\n`;
            });
            
            const addressRows = card.querySelectorAll('.address-table tbody tr');
            if (addressRows.length > 0) {
                ownerInfo += '\nAddresses:\n';
                addressRows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    ownerInfo += `${cells[0].textContent}, ${cells[1].textContent}, ${cells[2].textContent} ${cells[3].textContent}\n`;
                });
            }
            
            const related = card.querySelector('.related-persons p');
            if (related) {
                ownerInfo += `\nRelated: ${related.textContent}\n`;
            }
            
            ownerInfo += '\n--------------------------------\n';
        });
    }
    
    const fullText = phoneInfo + ownerInfo;
    
    navigator.clipboard.writeText(fullText).then(() => {
        alert('Results copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy results. Please try again.');
    });
}

// Share results
function shareResults() {
    if (navigator.share) {
        const phoneInfo = `
Phone Number: ${phoneNumber.textContent}
State: ${phoneState.textContent}
DNC National: ${dncNational.textContent}
DNC State: ${dncState.textContent}
Litigator: ${litigator.textContent}
Blacklist: ${blacklist.textContent}
        `;
        
        navigator.share({
            title: 'Phone Lookup Results',
            text: phoneInfo,
            url: window.location.href
        }).catch(err => {
            console.error('Error sharing:', err);
            alert('Sharing failed. Please try again or use copy instead.');
        });
    } else {
        alert('Web Share API not supported in your browser. Use copy instead.');
    }
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    if (isDark) {
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    updateThemeButton(darkMode);
}

// Initialize the app
init();
