function calculerDevis() {
  const produits = JSON.parse(localStorage.getItem("produits") || "[]");
  const client = localStorage.getItem("client");
  const electricien = localStorage.getItem("electricien");
  const date = localStorage.getItem("date");
  const heures = parseFloat(localStorage.getItem("heures"));
  const tarifHoraire = parseFloat(localStorage.getItem("tarifHoraire"));
  const tvaMain = parseFloat(localStorage.getItem("tvaMain"));
  const numeroDevis = "D" + Date.now();

  let totalHT = 0;
  let totalTVA = 0;
  let lignesProduits = "";
  let ligneMainOeuvre = "";

  if (heures > 0 && tarifHoraire > 0) {
    const totalMainHT = heures * tarifHoraire;
    const montantTVA = totalMainHT * (tvaMain / 100);
    const totalMainTTC = totalMainHT + montantTVA;
    totalHT += totalMainHT;
    totalTVA += montantTVA;

    ligneMainOeuvre = `
      <table style="margin-top:20px;">
        <thead>
          <tr><th>Désignation</th><th>Heures</th><th>PU HT</th><th>TVA</th><th>Total TTC</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Main-d’œuvre</td>
            <td>${heures}</td>
            <td>${tarifHoraire.toFixed(0)} FCFA</td>
            <td>${tvaMain}%</td>
            <td>${totalMainTTC.toFixed(0)} FCFA</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  produits.forEach(p => {
    const totalLigneHT = p.prix * p.quantite;
    const montantTVA = totalLigneHT * (p.tva / 100);
    const totalTTC = totalLigneHT + montantTVA;
    totalHT += totalLigneHT;
    totalTVA += montantTVA;

    lignesProduits += `
      <tr>
        <td>${p.image ? `<img src="${p.image}" alt="${p.nom}" width="40">` : "🛠️"} ${p.nom}</td>
        <td>${p.quantite}</td>
        <td>${p.prix.toFixed(0)} FCFA</td>
        <td>${p.tva}%</td>
        <td>${totalTTC.toFixed(0)} FCFA</td>
      </tr>
    `;
  });

  const totalTTC = totalHT + totalTVA;
  const paiementValide = localStorage.getItem("paiementValide") === "true";
  const entetePerso = JSON.parse(localStorage.getItem("entetePerso") || "{}");

  const enteteHTML = paiementValide ? `
    <div style="border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:20px;">
      ${entetePerso.logo ? `<img src="${entetePerso.logo}" alt="Logo" style="height:60px;">` : ""}
      <h1 style="margin:0;">${entetePerso.nom || "🔧 Devis Professionnel"}</h1>
      <p style="margin:0;">${entetePerso.contact || "📍 Bénin | 📞 +229 XX XX XX XX"}</p>
    </div>
  ` : `
    <div style="border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:20px;">
      <h1 style="margin:0;">🔧 Devis Professionnel</h1>
      <p style="margin:0;">Technicien indépendant – Générateur de devis</p>
      <p style="margin:0;">📍 Bénin | 📞 +229 XX XX XX XX</p>
    </div>
  `;

  document.getElementById("resultat").innerHTML = `
    ${enteteHTML}
    <h2>📄 Devis N°${numeroDevis}</h2>
    <p><strong>Date :</strong> ${date}</p>
    <p><strong>Client :</strong> ${client}</p>
    <p><strong>Technicien :</strong> ${electricien}</p>
    ${ligneMainOeuvre}
    <table style="margin-top:20px;">
      <thead>
        <tr><th>Désignation</th><th>Quantité</th><th>PU HT</th><th>TVA</th><th>Total TTC</th></tr>
      </thead>
      <tbody>${lignesProduits}</tbody>
    </table>
    <div style="text-align:right; margin-top:20px;">
      <p><strong>Total HT :</strong> ${totalHT.toFixed(0)} FCFA</p>
      <p><strong>Total TVA :</strong> ${totalTVA.toFixed(0)} FCFA</p>
      <p><strong>Total TTC :</strong> ${totalTTC.toFixed(0)} FCFA</p>
    </div>
    <div class="page-break"></div>
    <div style="display:flex; justify-content:space-between; margin-top:40px;">
      <p><em>Signature du technicien : ____________</em></p>
      <p style="text-align:right;"><em>Signature du client : ____________</em></p>
    </div>
  `;

  const historique = JSON.parse(localStorage.getItem("historiqueDevis") || "[]");
  historique.push({ numero: numeroDevis, client, electricien, date, produits, totalTTC: totalTTC.toFixed(0), entetePerso: paiementValide });
  localStorage.setItem("historiqueDevis", JSON.stringify(historique));
}

function telechargerPDF() {
  const element = document.getElementById("resultat");
  if (!element || element.innerHTML.trim() === "") {
    alert("Veuillez d'abord générer le devis.");
    return;
  }

  const opt = {
    margin: 10,
    filename: 'devis_ElecPro.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(element).save();
}

function envoyerWhatsApp() {
  const client = localStorage.getItem("client") || "Client";
  const electricien = localStorage.getItem("electricien") || "Technicien";
  const date = localStorage.getItem("date") || "Date";
  const produits = JSON.parse(localStorage.getItem("produits") || "[]");

  let message = `📄 *Devis Professionnel*\n`;
  message += `👤 Client : ${client}\n👨‍🔧 Technicien : ${electricien}\n📅 Date : ${date}\n\n`;

  produits.forEach(p => {
    message += `🔹 ${p.nom} x${p.quantite} – ${p.prix.toFixed(0)} FCFA HT\n`;
  });

  const heures = parseFloat(localStorage.getItem("heures"));
  const tarifHoraire = parseFloat(localStorage.getItem("tarifHoraire"));
  const tvaMain = parseFloat(localStorage.getItem("tvaMain"));

  if (heures > 0 && tarifHoraire > 0) {
    const totalMainHT = heures * tarifHoraire;
    const montantTVA = totalMainHT * (tvaMain / 100);
    const totalMainTTC = totalMainHT + montantTVA;
    message += `🛠️ Main-d’œuvre : ${heures}h x ${tarifHoraire} FCFA = ${totalMainTTC.toFixed(0)} FCFA TTC\n`;
  }

  const totalHT = produits.reduce((acc, p) => acc + p.prix * p.quantite, 0) + (heures * tarifHoraire || 0);
  const totalTVA = produits.reduce((acc, p) => acc + (p.prix * p.quantite * p.tva / 100), 0) + ((heures * tarifHoraire * tvaMain / 100) || 0);
  const totalTTC = totalHT + totalTVA;

  message += `\n💰 *Total HT* : ${totalHT.toFixed(0)} FCFA\n`;
    message += `💰 *Total TVA* : ${totalTVA.toFixed(0)} FCFA\n`;
  message += `💵 *Total TTC* : ${totalTTC.toFixed(0)} FCFA\n\n`;
  message += `✅ Généré avec ÉlecProDevis`;

  const numeroWhatsApp = prompt("Numéro WhatsApp du client (format : 229XXXXXXXX):");
  if (!numeroWhatsApp) return;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  function calculerDevis() {
  const client = localStorage.getItem("client");
  const electricien = localStorage.getItem("electricien");
  const date = localStorage.getItem("date");
  const heures = parseFloat(localStorage.getItem("heures") || "0");
  const tarifHoraire = parseFloat(localStorage.getItem("tarifHoraire") || "0");
  const tvaMain = parseFloat(localStorage.getItem("tvaMain") || "0");
  const produits = JSON.parse(localStorage.getItem("produits") || "[]");
  const nomEntreprise = localStorage.getItem("nomEntreprise") || "Entreprise";
  const contactEntreprise = localStorage.getItem("contactEntreprise") || "Contact";
  const logoEntreprise = localStorage.getItem("logoEntreprise") || "";

  const entete = document.getElementById("enteteDevis");
  entete.innerHTML = `
    <div><strong>Client :</strong> ${client}<br><strong>Date :</strong> ${date}</div>
    <div><strong>Technicien :</strong> ${electricien}<br><strong>Heures :</strong> ${heures} h</div>
    <div><strong>Entreprise :</strong> ${nomEntreprise}<br><strong>Contact :</strong> ${contactEntreprise}</div>
    ${logoEntreprise ? `<div><img src="${logoEntreprise}" alt="Logo" style="max-height:60px;"></div>` : ""}
  `;

  const tbody = document.querySelector("#tableDevis tbody");
  tbody.innerHTML = "";
  let totalProduits = 0;

  produits.forEach(p => {
    const totalHT = p.prix * p.quantite;
    const totalTTC = totalHT * (1 + p.tva / 100);
    totalProduits += totalTTC;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nom}</td>
      <td>${p.quantite}</td>
      <td>${p.prix.toFixed(0)} FCFA</td>
      <td>${p.tva}%</td>
      <td>${totalTTC.toFixed(0)} FCFA</td>
    `;
    tbody.appendChild(tr);
  });

  const totalMainHT = heures * tarifHoraire;
  const totalMainTTC = totalMainHT * (1 + tvaMain / 100);
  totalProduits += totalMainTTC;

  const trMain = document.createElement("tr");
  trMain.innerHTML = `
    <td>Main-d’œuvre</td>
    <td>${heures}</td>
    <td>${tarifHoraire.toFixed(0)} FCFA</td>
    <td>${tvaMain}%</td>
    <td>${totalMainTTC.toFixed(0)} FCFA</td>
  `;
  tbody.appendChild(trMain);

  document.getElementById("totalGlobal").textContent = `Total TTC : ${totalProduits.toFixed(0)} FCFA`;

  // Historique
  const historique = JSON.parse(localStorage.getItem("historiqueDevis") || "[]");
  const numero = historique.length + 1;
  historique.push({ numero, client, electricien, date, totalTTC: totalProduits.toFixed(0) });
  localStorage.setItem("historiqueDevis", JSON.stringify(historique));
}

}
