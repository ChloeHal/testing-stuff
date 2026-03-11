import { useState } from "react";

const SUB_TABS = ["Tous les devis", "Détail devis", "Pilotage depuis le devis", "Rentabilité"] as const;

function DevisList() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Devis</h3>
          <div className="flex gap-1 text-[10px]">
            {["Tous", "Brouillon", "Envoyé", "Signé"].map((f) => (
              <button key={f} className={`px-2 py-0.5 rounded-full ${f === "Tous" ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
        </div>
        <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">+ Nouveau devis</button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-400 border-b border-slate-100">
            <th className="text-left pb-2 font-medium">Réf.</th>
            <th className="text-left pb-2 font-medium">Client</th>
            <th className="text-left pb-2 font-medium">Événement</th>
            <th className="text-right pb-2 font-medium">Convives</th>
            <th className="text-right pb-2 font-medium">Total HT</th>
            <th className="text-right pb-2 font-medium">Marge</th>
            <th className="text-right pb-2 font-medium">Statut</th>
            <th className="text-right pb-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {[
            { ref: "D-2025-042", client: "Dupont", event: "Mariage", pax: 180, total: "16 776€", marge: "32,8%", margeOk: true, status: "Signé", statusColor: "bg-emerald-100 text-emerald-700", date: "5 mars" },
            { ref: "D-2025-043", client: "BNP Paribas", event: "Séminaire", pax: 60, total: "4 200€", marge: "35,1%", margeOk: true, status: "Signé", statusColor: "bg-emerald-100 text-emerald-700", date: "8 mars" },
            { ref: "D-2025-044", client: "Martin", event: "Anniversaire", pax: 45, total: "3 800€", marge: "29,4%", margeOk: false, status: "Signé", statusColor: "bg-emerald-100 text-emerald-700", date: "10 mars" },
            { ref: "D-2025-045", client: "Hermès", event: "Brunch", pax: 80, total: "6 400€", marge: "31,2%", margeOk: true, status: "Envoyé", statusColor: "bg-blue-100 text-blue-700", date: "12 mars" },
            { ref: "D-2025-046", client: "Fondation Cartier", event: "Gala", pax: 250, total: "28 500€", marge: "33,5%", margeOk: true, status: "Envoyé", statusColor: "bg-blue-100 text-blue-700", date: "14 mars" },
            { ref: "D-2025-047", client: "Chanel", event: "Cocktail presse", pax: 120, total: "9 600€", marge: "34,2%", margeOk: true, status: "Brouillon", statusColor: "bg-slate-100 text-slate-600", date: "15 mars" },
          ].map((d) => (
            <tr key={d.ref} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
              <td className="py-2.5 text-slate-500 font-mono text-[10px]">{d.ref}</td>
              <td className="py-2.5 text-slate-800 font-medium">{d.client}</td>
              <td className="py-2.5 text-slate-600">{d.event}</td>
              <td className="py-2.5 text-right text-slate-600">{d.pax}</td>
              <td className="py-2.5 text-right text-slate-800 font-medium">{d.total}</td>
              <td className={`py-2.5 text-right font-medium ${d.margeOk ? "text-emerald-600" : "text-amber-600"}`}>{d.marge}</td>
              <td className="py-2.5 text-right"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${d.statusColor}`}>{d.status}</span></td>
              <td className="py-2.5 text-right text-slate-400">{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DevisDetail() {
  return (
    <div className="space-y-4">
      {/* Event description input → auto-generated quote */}
      <div className="bg-brand-50 rounded-xl border border-brand-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Auto-généré</span>
          <p className="text-xs text-brand-700 font-medium">Le devis ci-dessous a été généré à partir de cette description :</p>
        </div>
        <div className="bg-white rounded-lg border border-brand-200 p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-brand-600 text-sm">📝</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="italic text-slate-600">« Mariage, 180 personnes, 22 mars à l'Hôtel Le Bristol. Service de 18h à 2h du matin. Cocktail dînatoire 8 pièces par personne, entrée saumon fumé, plat principal boeuf en croûte pour la majorité et bar en papillote pour 40 personnes, pièce montée en dessert. Boissons comprises. »</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
            <span className="text-[10px] text-brand-600 font-medium">Quantités, prix, coûts de revient et marges calculés automatiquement</span>
          </div>
          <span className="text-[10px] text-slate-400">|</span>
          <span className="text-[10px] text-slate-500">Basé sur vos recettes, votre catalogue et vos coûts fournisseurs</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Devis D-2025-042 — Mariage Dupont</h3>
          <p className="text-[11px] text-slate-400">22 mars 2025 • Hôtel Le Bristol • 180 convives • Service 18h–2h</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium">Dupliquer</button>
          <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">Envoyer au client</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Menu / lignes du devis */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lignes du devis</h4>
            <span className="text-[9px] text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full font-medium">8 lignes générées depuis la description</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-2 font-medium">Prestation</th>
                <th className="text-right pb-2 font-medium">Qté</th>
                <th className="text-right pb-2 font-medium">PU HT</th>
                <th className="text-right pb-2 font-medium">Coût revient</th>
                <th className="text-right pb-2 font-medium">Total HT</th>
                <th className="text-right pb-2 font-medium">Marge</th>
              </tr>
            </thead>
            <tbody>
              {[
                { prestation: "Cocktail dînatoire", detail: "8 pièces/pers — mini tartares, verrines, blinis", qty: "180", pu: "14,00€", cout: "5,80€", total: "2 520€", marge: "58,6%", auto: true },
                { prestation: "Entrée — Saumon fumé maison", detail: "Gravlax, crème d'aneth, blinis de sarrasin", qty: "180", pu: "8,50€", cout: "3,20€", total: "1 530€", marge: "62,4%", auto: true },
                { prestation: "Plat — Filet de boeuf en croûte", detail: "Filet, duxelles, pâte feuilletée, sauce Périgueux", qty: "140", pu: "22,00€", cout: "12,50€", total: "3 080€", marge: "43,2%", auto: true },
                { prestation: "Plat — Bar en papillote", detail: "Bar de ligne, légumes primeur, beurre blanc", qty: "40", pu: "19,00€", cout: "9,80€", total: "760€", marge: "48,4%", auto: true },
                { prestation: "Dessert — Pièce montée", detail: "Choux, nougatine, crème diplomate", qty: "180", pu: "6,00€", cout: "2,10€", total: "1 080€", marge: "65,0%", auto: true },
                { prestation: "Boissons", detail: "Champagne, vins, soft, café", qty: "180", pu: "18,00€", cout: "9,50€", total: "3 240€", marge: "47,2%", auto: true },
                { prestation: "Personnel de service", detail: "12 serveurs × 8h — calculé selon 1 serveur / 15 convives", qty: "12", pu: "240,00€", cout: "180,00€", total: "2 880€", marge: "25,0%", auto: true },
                { prestation: "Location matériel", detail: "18 tables rondes, 180 chaises, nappes, vaisselle complète", qty: "1", pu: "1 686,00€", cout: "980,00€", total: "1 686€", marge: "41,9%", auto: true },
              ].map((l) => (
                <tr key={l.prestation} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-slate-800 font-medium">{l.prestation}</p>
                    </div>
                    <p className="text-[10px] text-slate-400">{l.detail}</p>
                  </td>
                  <td className="py-2 text-right text-slate-600">{l.qty}</td>
                  <td className="py-2 text-right text-slate-600">{l.pu}</td>
                  <td className="py-2 text-right text-slate-400">{l.cout}</td>
                  <td className="py-2 text-right text-slate-800 font-medium">{l.total}</td>
                  <td className="py-2 text-right text-emerald-600 font-medium">{l.marge}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="pt-3 text-slate-800 font-bold">Total</td>
                <td colSpan={3}></td>
                <td className="pt-3 text-right text-slate-900 font-bold text-sm">16 776€ HT</td>
                <td className="pt-3 text-right text-emerald-600 font-bold">32,8%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Sidebar recap */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Récapitulatif</h4>
            <div className="space-y-2 text-xs">
              {[
                { k: "Total HT", v: "16 776€", bold: true },
                { k: "TVA (10%)", v: "1 677,60€", bold: false },
                { k: "Total TTC", v: "18 453,60€", bold: true },
                { k: "Coût de revient", v: "11 272€", bold: false },
                { k: "Marge brute", v: "5 504€", bold: true },
              ].map((r) => (
                <div key={r.k} className={`flex justify-between ${r.bold ? "font-bold text-slate-800" : "text-slate-600"}`}>
                  <span>{r.k}</span>
                  <span>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Infos client</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p><span className="text-slate-400">Client :</span> M. et Mme Dupont</p>
              <p><span className="text-slate-400">Email :</span> dupont@email.com</p>
              <p><span className="text-slate-400">Tél :</span> 06 12 34 56 78</p>
              <p><span className="text-slate-400">Lieu :</span> Hôtel Le Bristol, Paris 8e</p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
            <h4 className="text-xs font-semibold text-emerald-700 mb-1">Généré depuis ce devis</h4>
            <p className="text-[9px] text-emerald-600 mb-2">Tout est créé automatiquement à la signature</p>
            <div className="space-y-1.5 text-[11px] text-emerald-700">
              <div className="flex items-center justify-between">
                <span>✓ 4 fiches production</span>
                <span className="text-[9px] text-emerald-500">auto</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ 52 lignes ingrédients</span>
                <span className="text-[9px] text-emerald-500">auto</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ 12 postes staff</span>
                <span className="text-[9px] text-emerald-500">auto</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ 18 réfs matériel réservées</span>
                <span className="text-[9px] text-emerald-500">auto</span>
              </div>
              <div className="flex items-center justify-between">
                <span>✓ Timeline logistique</span>
                <span className="text-[9px] text-emerald-500">auto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function PilotageDevis() {
  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800">Devis D-2025-042 validé — Mariage Dupont</h3>
            <p className="text-[11px] text-emerald-600">Signé le 5 mars 2025 • 180 convives • 16 776€ HT</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold">Tout le pilotage a été généré automatiquement</span>
      </div>

      {/* Generated modules grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Production */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">👨‍🍳</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Production</h4>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">4 fiches générées</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { fiche: "Cocktail dînatoire", detail: "1 440 pièces (8×180)", ingredients: "12 ingrédients", status: "Prêt" },
              { fiche: "Gravlax de saumon", detail: "180 portions", ingredients: "6 ingrédients", status: "Prêt" },
              { fiche: "Boeuf en croûte", detail: "140 portions — 35 kg filet", ingredients: "8 ingrédients", status: "Prêt" },
              { fiche: "Bar en papillote", detail: "40 portions — 12 kg bar", ingredients: "7 ingrédients", status: "Prêt" },
            ].map((f) => (
              <div key={f.fiche} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                <div>
                  <span className="text-slate-800 font-medium">{f.fiche}</span>
                  <p className="text-[9px] text-slate-400">{f.detail} • {f.ingredients}</p>
                </div>
                <span className="text-emerald-600 text-[9px] font-medium">{f.status}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Quantités calculées depuis le devis. Recettes liées à votre catalogue.</p>
        </div>

        {/* Stock & Achats */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🥕</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Stock & Achats</h4>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">52 lignes consolidées</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { item: "Filet de boeuf", besoin: "35 kg", stock: "12 kg", commande: "23 kg", fourn: "Boucherie Lenôtre", urgent: true },
              { item: "Saumon fumé", besoin: "14 kg", stock: "0", commande: "14 kg", fourn: "Marée du Jour", urgent: true },
              { item: "Pâte feuilletée", besoin: "18 kg", stock: "5 kg", commande: "13 kg", fourn: "Metro Cash", urgent: false },
              { item: "Crème fraîche", besoin: "8 L", stock: "10 L", commande: "—", fourn: "—", urgent: false },
              { item: "Beurre AOP", besoin: "6 kg", stock: "8 kg", commande: "—", fourn: "—", urgent: false },
            ].map((r) => (
              <div key={r.item} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-800 font-medium">{r.item}</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400">{r.besoin}</span>
                  {r.commande === "—" ? (
                    <span className="text-emerald-600 font-medium">✓ en stock</span>
                  ) : (
                    <span className={`font-medium ${r.urgent ? "text-red-600" : "text-amber-600"}`}>→ {r.commande}</span>
                  )}
                </div>
              </div>
            ))}
            <p className="text-[9px] text-slate-400">+ 47 lignes. Consolidé avec les autres events de la semaine.</p>
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Stock vérifié en temps réel. Commandes pré-remplies par fournisseur.</p>
        </div>

        {/* Staff */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">👥</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Staff</h4>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">12 postes pourvus</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { role: "Chef de cuisine", nb: 1, noms: "Lucas M.", dispo: true },
              { role: "Seconds de cuisine", nb: 2, noms: "Jean P., Amira K.", dispo: true },
              { role: "Chef de rang", nb: 1, noms: "Marie D.", dispo: true },
              { role: "Serveurs", nb: 6, noms: "Paul, Sophie, Thomas, +3", dispo: true },
              { role: "Runners / plonge", nb: 2, noms: "Hugo V., Léa F.", dispo: true },
            ].map((p) => (
              <div key={p.role} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                <div>
                  <span className="text-slate-800 font-medium">{p.role}</span>
                  <span className="text-slate-400 ml-1">(×{p.nb})</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-500">{p.noms}</span>
                  <span className="text-emerald-600 font-medium">✓</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Calculé : 1 serveur / 15 convives. Dispos vérifiées automatiquement.</p>
        </div>

        {/* Matériel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🍽</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Matériel</h4>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">18 réfs réservées</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { item: "Tables rondes 10p", qty: 18, dispo: true, note: "28 en stock" },
              { item: "Chaises pliantes", qty: 180, dispo: true, note: "200 en stock" },
              { item: "Nappes blanches", qty: 20, dispo: false, note: "15 en stock → 5 en location" },
              { item: "Assiettes plates (lot 10)", qty: 20, dispo: true, note: "22 en stock" },
              { item: "Verres à vin (lot 12)", qty: 16, dispo: true, note: "18 en stock" },
            ].map((m) => (
              <div key={m.item} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                <div>
                  <span className="text-slate-800 font-medium">{m.item}</span>
                  <span className="text-slate-400 ml-1">×{m.qty}</span>
                </div>
                {m.dispo ? (
                  <span className="text-emerald-600 text-[10px] font-medium">✓ {m.note}</span>
                ) : (
                  <span className="text-amber-600 text-[10px] font-medium">⚠ {m.note}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Disponibilité vérifiée vs les autres events de la semaine.</p>
        </div>
      </div>

      {/* Logistique */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🚛</span>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Logistique & Timeline</h4>
          </div>
          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">22 étapes générées</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { time: "06:00", label: "Chargement", detail: "Bacs GN + mobilier" },
            { time: "07:30", label: "Départ convoi", detail: "2 camions" },
            { time: "08:15", label: "Installation", detail: "Tables, chaises, nappes" },
            { time: "11:30", label: "Mise en place cuisine", detail: "Réchauds, postes" },
            { time: "14:00", label: "Pause + brief", detail: "Repas staff" },
            { time: "15:00", label: "Finitions", detail: "Cuissons, dressage cocktail" },
            { time: "18:00", label: "Cocktail", detail: "1 440 pièces" },
            { time: "19:30", label: "Entrée", detail: "180 assiettes" },
            { time: "20:00", label: "Plat", detail: "140 boeuf + 40 bar" },
            { time: "21:00", label: "Dessert", detail: "Pièce montée" },
            { time: "23:00", label: "Rangement", detail: "Plonge + inventaire" },
            { time: "02:00", label: "Démontage", detail: "Chargement retour" },
          ].map((s, i) => (
            <div key={i} className="shrink-0 w-24 bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
              <p className="text-[10px] font-mono text-brand-600 font-bold">{s.time}</p>
              <p className="text-[9px] font-semibold text-slate-800 mt-0.5">{s.label}</p>
              <p className="text-[8px] text-slate-400">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-slate-400 mt-2">Timeline complète + checklist départ (22 items) + attribution véhicules — tout généré depuis le devis.</p>
      </div>

      {/* Update propagation */}
      <div className="bg-brand-50 rounded-xl border border-brand-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm">↻</span>
          </div>
          <div>
            <p className="text-sm font-bold text-brand-800">Le devis change ? Tout se met à jour.</p>
            <p className="text-[11px] text-brand-600">Exemple : le client passe de 180 à 200 convives</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { module: "Production", before: "1 440 pcs cocktail", after: "1 600 pcs cocktail", icon: "👨‍🍳" },
            { module: "Stock", before: "35 kg boeuf", after: "39 kg boeuf", icon: "🥕" },
            { module: "Staff", before: "12 serveurs", after: "14 serveurs", icon: "👥" },
            { module: "Matériel", before: "18 tables", after: "20 tables", icon: "🍽" },
            { module: "Devis", before: "16 776€", after: "18 640€", icon: "💶" },
          ].map((u) => (
            <div key={u.module} className="bg-white rounded-lg border border-brand-100 p-2.5 text-center">
              <p className="text-sm">{u.icon}</p>
              <p className="text-[9px] font-bold text-slate-800 mt-1">{u.module}</p>
              <p className="text-[9px] text-slate-400 line-through mt-1">{u.before}</p>
              <p className="text-[10px] text-brand-700 font-semibold">{u.after}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-brand-600 mt-3 text-center font-medium">1 modification du devis = mise à jour instantanée de toute la chaîne. Zéro ressaisie.</p>
      </div>
    </div>
  );
}

function DevisRentabilite() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Analyse rentabilité — Mars 2025</h3>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "CA total signé", value: "87 400€", sub: "14 events", color: "text-brand-600" },
          { label: "Coût de revient", value: "58 760€", sub: "Matières + staff + matériel", color: "text-slate-700" },
          { label: "Marge brute", value: "28 640€", sub: "32,8% en moyenne", color: "text-emerald-600" },
          { label: "Objectif marge", value: "30%", sub: "✓ Dépassé de +2,8pts", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Marge par événement</h4>
        <div className="space-y-2">
          {[
            { event: "Mariage Dupont", ca: "16 776€", cout: "11 272€", marge: "5 504€", pct: 32.8, target: 30 },
            { event: "Séminaire BNP", ca: "4 200€", cout: "2 726€", marge: "1 474€", pct: 35.1, target: 30 },
            { event: "Anniv. Martin", ca: "3 800€", cout: "2 683€", marge: "1 117€", pct: 29.4, target: 30 },
            { event: "Brunch Hermès", ca: "6 400€", cout: "4 403€", marge: "1 997€", pct: 31.2, target: 30 },
            { event: "Gala Fondation Cartier", ca: "28 500€", cout: "18 952€", marge: "9 548€", pct: 33.5, target: 30 },
          ].map((e) => (
            <div key={e.event} className="flex items-center gap-3 text-xs">
              <span className="text-slate-700 font-medium w-44">{e.event}</span>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
                <div className={`absolute inset-y-0 left-0 rounded-full ${e.pct >= e.target ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${e.pct * 2.5}%` }} />
                <div className="absolute inset-y-0 border-r-2 border-dashed border-slate-400" style={{ left: `${e.target * 2.5}%` }} />
              </div>
              <span className={`w-12 text-right font-bold ${e.pct >= e.target ? "text-emerald-600" : "text-amber-600"}`}>{e.pct}%</span>
              <span className="w-20 text-right text-slate-500">{e.marge}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Au-dessus objectif</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Sous objectif</span>
          <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-dashed border-slate-400"></span> Objectif 30%</span>
        </div>
      </div>
    </div>
  );
}

export function ScreenDevis() {
  const [sub, setSub] = useState(0);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
        {SUB_TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setSub(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
              sub === i ? "bg-white border border-b-0 border-slate-200 text-brand-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {sub === 0 && <DevisList />}
      {sub === 1 && <DevisDetail />}
      {sub === 2 && <PilotageDevis />}
      {sub === 3 && <DevisRentabilite />}
    </div>
  );
}
