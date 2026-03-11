import { useState } from "react";

const SUB_TABS = ["Timeline jour J", "Checklist départ", "Historique événements"] as const;

function TimelineJourJ() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Timeline — Mariage Dupont</h3>
          <p className="text-[10px] text-slate-400">Samedi 22 mars 2025 • Hôtel Le Bristol • 180 convives • Service 18h–2h</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium">Imprimer</button>
          <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">Partager à l'équipe</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="space-y-0">
          {[
            { time: "06:00", phase: "Chargement", tasks: ["Vérifier checklist matériel", "Charger bacs GN dans frigo camion 1", "Charger mobilier dans camion 2"], responsible: "Hugo V. + Léa F.", duration: "1h30", status: "upcoming" },
            { time: "07:30", phase: "Départ convoi", tasks: ["Camion 1 (frigo) : Lucas M. + Jean P.", "Camion 2 (matériel) : Hugo V. + Thomas B."], responsible: "Tous", duration: "45 min trajet", status: "upcoming" },
            { time: "08:15", phase: "Installation sur site", tasks: ["Déchargement et mise en place cuisine", "Installation tables et chaises (18 tables rondes)", "Nappes, couverts, verres — plan de table client"], responsible: "Équipe complète", duration: "3h", status: "upcoming" },
            { time: "11:30", phase: "Mise en place cuisine", tasks: ["Installer réchauds et postes de travail", "Sortir bacs GN, vérifier températures", "Préparer la ligne de dressage"], responsible: "Lucas M. + Jean P. + Amira K.", duration: "2h", status: "upcoming" },
            { time: "14:00", phase: "Pause équipe", tasks: ["Repas staff sur place", "Brief de service avec tout le monde"], responsible: "Tous", duration: "1h", status: "upcoming" },
            { time: "15:00", phase: "Finitions", tasks: ["Cuissons dernière minute (bar en papillote)", "Dressage cocktail — 1 440 pièces sur plateaux", "Vérification générale salle + cuisine"], responsible: "Cuisine + Salle", duration: "2h30", status: "upcoming" },
            { time: "17:30", phase: "Accueil traiteur", tasks: ["Coordination avec maître d'hôtel Bristol", "Positionnement serveurs", "Champagne prêt au frais"], responsible: "Marie D.", duration: "30 min", status: "upcoming" },
            { time: "18:00", phase: "Cocktail", tasks: ["Service cocktail dînatoire — 8 pièces/pers", "Rotation plateaux toutes les 10 min", "Bar champagne + vins"], responsible: "6 serveurs + 2 runners", duration: "1h30", status: "upcoming" },
            { time: "19:30", phase: "Dîner — Entrée", tasks: ["Dressage gravlax de saumon — 180 assiettes", "Service à l'assiette en 3 vagues"], responsible: "Cuisine + Salle", duration: "30 min", status: "upcoming" },
            { time: "20:00", phase: "Dîner — Plat", tasks: ["Boeuf en croûte : 140 assiettes", "Bar en papillote : 40 assiettes", "Sauce Périgueux / Beurre blanc en saucière"], responsible: "Cuisine + Salle", duration: "45 min", status: "upcoming" },
            { time: "21:00", phase: "Dessert & soirée", tasks: ["Pièce montée — installation salle", "Café, mignardises", "Transition vers soirée dansante"], responsible: "Cuisine + Marie D.", duration: "1h", status: "upcoming" },
            { time: "23:00", phase: "Début rangement cuisine", tasks: ["Nettoyage postes, rangement bacs GN", "Plonge complète", "Inventaire casse/perte"], responsible: "Hugo V. + Léa F.", duration: "1h30", status: "upcoming" },
            { time: "01:00", phase: "Fin de soirée", tasks: ["Dernier service bar", "Rangement salle progressif"], responsible: "3 serveurs", duration: "1h", status: "upcoming" },
            { time: "02:00", phase: "Démontage & départ", tasks: ["Démontage mobilier", "Chargement camions", "Vérification rien oublié — checklist retour"], responsible: "Équipe complète", duration: "1h30", status: "upcoming" },
          ].map((step, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <div className="w-12 shrink-0 text-right">
                <span className="text-slate-500 font-mono font-medium">{step.time}</span>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  step.status === "done" ? "bg-emerald-500 border-emerald-500" :
                  step.status === "in_progress" ? "bg-brand-500 border-brand-500" :
                  "bg-white border-slate-300"
                }`} />
                {i < 13 && <div className="w-0.5 flex-1 bg-slate-200 min-h-[40px]" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{step.phase}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{step.duration}</span>
                    <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{step.responsible}</span>
                  </div>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {step.tasks.map((t, j) => (
                    <li key={j} className="text-[10px] text-slate-500 flex items-start gap-1">
                      <span className="text-slate-300 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChecklistDepart() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Checklist départ — Mariage Dupont (22 mars)</h3>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">18/22 items validés</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">🍳 Cuisine</h4>
          <div className="space-y-1.5">
            {[
              { item: "Bacs GN cocktail (8 bacs)", checked: true },
              { item: "Bacs GN entrées (4 bacs)", checked: true },
              { item: "Bacs GN boeuf en croûte (6 bacs)", checked: true },
              { item: "Bacs GN bar papillote (2 bacs)", checked: true },
              { item: "Sauces en containers (2×)", checked: true },
              { item: "Pièce montée (caisse spéciale)", checked: false },
              { item: "Réchauds ×5 + gaz", checked: true },
              { item: "Ustensiles de dressage", checked: true },
            ].map((c) => (
              <label key={c.item} className="flex items-center gap-2 text-[11px] cursor-pointer">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${c.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                  {c.checked && <span className="text-[8px]">✓</span>}
                </div>
                <span className={c.checked ? "text-slate-400 line-through" : "text-slate-700"}>{c.item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">🍽 Salle</h4>
          <div className="space-y-1.5">
            {[
              { item: "Tables rondes ×18", checked: true },
              { item: "Chaises ×180", checked: true },
              { item: "Nappes blanches ×20 (dont 5 location)", checked: true },
              { item: "Assiettes plates (20 lots)", checked: true },
              { item: "Assiettes dessert (20 lots)", checked: true },
              { item: "Verres à vin (16 lots)", checked: true },
              { item: "Flûtes champagne (16 lots)", checked: false },
              { item: "Couverts complets (180 sets)", checked: true },
              { item: "Serviettes tissu ×200", checked: false },
              { item: "Centres de table (du fleuriste)", checked: false },
            ].map((c) => (
              <label key={c.item} className="flex items-center gap-2 text-[11px] cursor-pointer">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${c.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                  {c.checked && <span className="text-[8px]">✓</span>}
                </div>
                <span className={c.checked ? "text-slate-400 line-through" : "text-slate-700"}>{c.item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">🚛 Véhicules</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { vehicle: "Camion frigo 1", driver: "Lucas M.", content: "Tous bacs GN alimentaires, pièce montée", temp: "3°C vérifié", depart: "07:30" },
            { vehicle: "Camion matériel 2", driver: "Hugo V.", content: "Tables, chaises, nappes, vaisselle, réchauds", temp: "—", depart: "07:30" },
          ].map((v) => (
            <div key={v.vehicle} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-800">{v.vehicle}</span>
                <span className="text-[10px] text-slate-400">Départ : {v.depart}</span>
              </div>
              <p className="text-[10px] text-slate-500">Chauffeur : {v.driver}</p>
              <p className="text-[10px] text-slate-500">Contenu : {v.content}</p>
              {v.temp !== "—" && <p className="text-[10px] text-emerald-600 font-medium mt-1">Température : {v.temp}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoriqueEvents() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Historique événements</h3>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="text-left pb-2 font-medium">Événement</th>
              <th className="text-left pb-2 font-medium">Date</th>
              <th className="text-right pb-2 font-medium">Convives</th>
              <th className="text-right pb-2 font-medium">CA</th>
              <th className="text-right pb-2 font-medium">Marge réelle</th>
              <th className="text-right pb-2 font-medium">Écart vs devis</th>
              <th className="text-left pb-2 font-medium pl-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[
              { event: "Cocktail L'Oréal", date: "15 mars", pax: 200, ca: "12 800€", marge: "34,2%", ecart: "+1,2%", ecartOk: true, notes: "Parfait, client très satisfait" },
              { event: "Dîner privé Rothschild", date: "12 mars", pax: 24, ca: "8 400€", marge: "42,1%", ecart: "+5,1%", ecartOk: true, notes: "Produits premium, marge excellente" },
              { event: "Brunch startup TechDay", date: "8 mars", pax: 150, ca: "5 250€", marge: "26,8%", ecart: "-3,2%", ecartOk: false, notes: "Surplus nourriture — ajuster portions" },
              { event: "Mariage Laurent", date: "1 mars", pax: 120, ca: "11 400€", marge: "31,5%", ecart: "+0,5%", ecartOk: true, notes: "RAS" },
              { event: "Gala Musée d'Orsay", date: "22 fév", pax: 300, ca: "34 500€", marge: "33,8%", ecart: "+2,3%", ecartOk: true, notes: "Logistique complexe bien gérée" },
              { event: "Anniv. entreprise Dior", date: "15 fév", pax: 80, ca: "7 200€", marge: "30,1%", ecart: "-0,9%", ecartOk: false, notes: "Staff supplémentaire non prévu" },
            ].map((e) => (
              <tr key={e.event} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <td className="py-2.5 text-slate-800 font-medium">{e.event}</td>
                <td className="py-2.5 text-slate-500">{e.date}</td>
                <td className="py-2.5 text-right text-slate-600">{e.pax}</td>
                <td className="py-2.5 text-right text-slate-800 font-medium">{e.ca}</td>
                <td className="py-2.5 text-right text-slate-600">{e.marge}</td>
                <td className={`py-2.5 text-right font-medium ${e.ecartOk ? "text-emerald-600" : "text-red-500"}`}>{e.ecart}</td>
                <td className="py-2.5 text-slate-400 pl-3 text-[10px]">{e.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScreenLogistique() {
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
      {sub === 0 && <TimelineJourJ />}
      {sub === 1 && <ChecklistDepart />}
      {sub === 2 && <HistoriqueEvents />}
    </div>
  );
}
