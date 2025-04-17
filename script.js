const tcpaApi = "https://tcpa.api.uspeoplesearch.net/tcpa/v1?x=";
const premiumLookupApi = "https://premium_lookup-1-h4761841.deta.app/person?x=";

function showLoader(show) {
    document.getElementById("loader").style.display = show ? "block" : "none";
}

function checkStatus() {
    const phone = document.getElementById("phoneNumber").value.trim();
    if (!phone) {
        alert("Please enter a phone number");
        return;
    }

    showLoader(true);
    document.getElementById("result").innerHTML = "";

    fetch(tcpaApi + phone)
        .then(res => res.json())
        .then(tcpaData => {
            return fetch(premiumLookupApi + phone)
                .then(res => res.json())
                .then(personData => {
                    showLoader(false);
                    const resultHTML = `
                        <p><strong>Phone:</strong> ${tcpaData.phone}</p>
                        <p><strong>State:</strong> ${tcpaData.state}</p>
                        <p><strong>DNC National:</strong> ${tcpaData.ndnc === 'Yes' ? 'Yes' : 'No'}</p>
                        <p><strong>DNC State:</strong> ${tcpaData.sdnc === 'Yes' ? 'Yes' : 'No'}</p>
                        <p><strong>Litigator:</strong> ${tcpaData.type}</p>
                        <p><strong>Blacklist:</strong> ${tcpaData.listed}</p>
                        <hr>
                        <p><strong>Person Name:</strong> ${personData.name || 'N/A'}</p>
                        <p><strong>Address:</strong> ${personData.address || 'N/A'}</p>
                        <p><strong>City:</strong> ${personData.city || 'N/A'}</p>
                        <p><strong>State:</strong> ${personData.state || 'N/A'}</p>
                        <p><strong>ZIP:</strong> ${personData.zip || 'N/A'}</p>
                        <p><strong>Age:</strong> ${personData.age || 'N/A'}</p>
                    `;
                    document.getElementById("result").innerHTML = resultHTML;
                    updateRecentSearches(phone);
                });
        })
        .catch(error => {
            console.error("Error:", error);
            showLoader(false);
            document.getElementById("result").innerHTML = "<p style='color:red;'>Error fetching data.</p>";
        });
}

function copyResult() {
    const resultText = document.getElementById("result").innerText;
    navigator.clipboard.writeText(resultText);
    alert("Result copied to clipboard!");
}

function shareResult() {
    const resultText = document.getElementById("result").innerText;
    if (navigator.share) {
        navigator.share({ text: resultText });
    } else {
        alert("Share not supported in this browser.");
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function updateRecentSearches(phone) {
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    if (!recent.includes(phone)) {
        recent.unshift(phone);
        if (recent.length > 5) recent.pop();
        localStorage.setItem("recentSearches", JSON.stringify(recent));
    }
    showRecentSearches();
}

function showRecentSearches() {
    let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    document.getElementById("recent").innerHTML =
        `<strong>Recent Searches:</strong><br>` + recent.map(num => `<span>${num}</span>`).join("<br>");
}

showRecentSearches();
