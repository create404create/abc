// Updated API endpoints based on your console output
const tcpaApi = "https://tcpa.api.uspeoplesearch.net/tcpa/v1/x-";
const personApi = "https://api.uspeoplesearch.net/person/v3/x-";
const premiumLookupApi = "https://premium_lookup-1-h4761841.deta.app/person/x-";
const reportApi = "https://api.uspeoplesearch.net/tcpa/report/x-";

// Modified updatePhoneInfo function to match actual API response
function updatePhoneInfo(phone, data) {
    phoneNumber.textContent = formatPhoneNumber(phone);
    phoneState.textContent = data.state || '-';
    
    // Update fields based on actual API response structure
    updateStatusField(dncNational, data.sdnc === 'Yes' ? 'Yes' : 'No');
    updateStatusField(dncState, data.sdnc === 'Yes' ? 'Yes' : 'No');
    updateStatusField(litigator, data.listed === 'Yes' ? 'Yes' : 'No');
    updateStatusField(blacklist, data.listed === 'Yes' ? 'Yes' : 'No');
}

// Enhanced error handling for owner information
async function handleSearch() {
    const phone = phoneInput.value.trim();
    
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        alert('Please enter a valid 10-digit US phone number');
        return;
    }
    
    try {
        searchBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Searching...';
        searchBtn.disabled = true;
        clearResults();
        
        // Fetch TCPA data with error handling
        let tcpaData = {};
        try {
            const response = await fetch(tcpaApi + phone);
            if (response.ok) {
                tcpaData = await response.json();
            } else {
                console.warn('TCPA API returned status:', response.status);
                tcpaData = { 
                    state: 'Unknown',
                    sdnc: 'No',
                    listed: 'No',
                    status: 'Error'
                };
            }
        } catch (error) {
            console.error('TCPA API error:', error);
            tcpaData = { 
                state: 'Error',
                sdnc: 'No',
                listed: 'No',
                status: 'Error'
            };
        }
        
        updatePhoneInfo(phone, tcpaData);
        
        // Fetch person data with error handling
        let personData = {};
        try {
            const response = await fetch(personApi + phone);
            if (response.ok) {
                personData = await response.json();
            }
        } catch (error) {
            console.error('Person API error:', error);
        }
        
        updateOwnerInfo(personData);
        addToRecentSearches(phone);
        
    } catch (error) {
        console.error('Search error:', error);
        alert('An error occurred while searching. Please check console for details.');
    } finally {
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
        searchBtn.disabled = false;
    }
}

// Modified updateOwnerInfo to handle different response structures
function updateOwnerInfo(data) {
    ownersContainer.innerHTML = '';
    
    if (!data || (!data.owners && !data.name)) {
        ownersContainer.innerHTML = '<p>No owner information found for this number.</p>';
        return;
    }
    
    const ownerCard = document.createElement('div');
    ownerCard.className = 'owner-card';
    
    // Handle different response structures
    if (data.owners) {
        // Original expected format
        const owner = data.owners[0];
        ownerCard.innerHTML = createOwnerHTML(owner);
    } else if (data.name) {
        // Alternative format from your API
        ownerCard.innerHTML = createOwnerHTML(data);
    }
    
    ownersContainer.appendChild(ownerCard);
}

function createOwnerHTML(owner) {
    return `
        <h3>${owner.name || 'Unknown'}</h3>
        <div class="owner-details">
            ${owner.age ? `<p><strong>Age:</strong> ${owner.age}</p>` : ''}
        </div>
        ${owner.address ? `
        <div class="owner-addresses">
            <h4>Address:</h4>
            <table class="address-table">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>City</th>
                        <th>State</th>
                        <th>ZIP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${owner.address || '-'}</td>
                        <td>${owner.city || '-'}</td>
                        <td>${owner.state || '-'}</td>
                        <td>${owner.zip || '-'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        ` : ''}
    `;
}
