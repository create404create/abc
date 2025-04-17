const apiUrl = "https://tcpa.api.uspeoplesearch.net/tcpa/v1?x=";
const premiumApi = "https://premium_lookup-1-h4761841.deta.app/person?x=";

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function saveToRecent(number) {
  let recents = JSON.parse(localStorage.getItem("recentNumbers")) || [];
  if (!recents.includes(number)) {
    recents.unshift(number);
    if (recents.length > 5) recents.pop();
    localStorage.setItem("recentNumbers", JSON.stringify(recents));
  }
  displayRecent();
}

function displayRecent() {
  let list = document.getElementById("recentList");
  let recents = JSON.parse(localStorage.getItem("recentNumbers")) || [];
  list.innerHTML = "";
  recents.forEach(num => {
    let li = document.createElement("li");
    li.innerText = num;
    li.onclick = () => {
      document.getElementById("phoneNumber").value = num;
      checkStatus();
    };
    list.appendChild(li);
  });
}

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
}

function checkStatus() {
  const number = document.getElementById("phoneNumber").value.trim();
  if (!number) return alert("Please enter a number");

  showLoader(true);
  saveToRecent(number);

  Promise.all([
    fetch(apiUrl + number).then(res => res.json()),
    fetch(premiumApi + number).then(res => res.json())
  ])
  .then(([tcpa, person]) => {
    showLoader(false);

    const html = `
      <p><strong>Phone:</strong> ${tcpa.phone || "N/A"}</p>
      <p><strong>State:</strong> ${tcpa.state || "N/A"}</p>
      <p><strong>DNC National:</strong> ${tcpa.ndnc === "Yes" ? "Yes" : "No"}</p>
      <p><strong>DNC State:</strong> ${tcpa.sdnc === "Yes" ? "Yes" : "No"}</p>
      <p><strong>Litigator:</strong> ${tcpa.type || "No"}</p>
      <p><strong>Blacklist:</strong> ${tcpa.listed || "No"}</p>
      <hr/>
      <p><strong>Name:</strong> ${person.name || "N/A"}</p>
      <p><strong>Address:</strong> ${person.address || "N/A"}</p>
      <p><strong>City:</strong> ${person.city || "N/A"}</p>
      <p><strong>State:</strong> ${person.state || "N/A"}</p>
      <p><strong>Zip:</strong> ${person.zip || "N/A"}</p>
      <p><strong>Age:</strong> ${person.age || "N/A"}</p>
    `;
    document.getElementById("result").innerHTML = html;
  })
  .catch(err => {
    console.error(err);
    showLoader(false);
    document.getElementById("result").innerHTML = "Error fetching data.";
  });
}

function copyResult() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}

function shareResult() {
  const text = document.getElementById("result").innerText;
  if (navigator.share) {
    navigator.share({
      title: "Phone Lookup Result",
      text
    });
  } else {
    alert("Share not supported on this browser.");
  }
}

function exportPDF() {
  const content = document.getElementById("result").innerText;
  const win = window.open('', '', 'height=700,width=700');
  win.document.write('<pre>' + content + '</pre>');
  win.document.close();
  win.print();
}

displayRecent();
