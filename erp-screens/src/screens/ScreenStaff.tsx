import { useState } from "react";

const SUB_TABS = ["Planning semaine", "Équipe", "Disponibilités"] as const;

function PlanningSemaine() {
  const days = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22", "Dim 23"];
  const staff = [
    { name: "Lucas M.", role: "Chef", events: [null, null, { name: "Prep BNP", hours: "8h–16h", color: "bg-blue-100 text-blue-700" }, null, { name: "Prep Dupont", hours: "6h–18h", color: "bg-brand-100 text-brand-700" }, { name: "Mariage Dupont", hours: "6h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Jean P.", role: "Second", events: [null, null, { name: "Prep BNP", hours: "8h–16h", color: "bg-blue-100 text-blue-700" }, null, { name: "Prep Dupont", hours: "6h–18h", color: "bg-brand-100 text-brand-700" }, { name: "Mariage Dupont", hours: "6h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Amira K.", role: "Second", events: [null, null, null, null, { name: "Prep Dupont", hours: "8h–18h", color: "bg-brand-100 text-brand-700" }, { name: "Mariage Dupont", hours: "8h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Marie D.", role: "Chef de rang", events: [null, null, null, { name: "Séminaire BNP", hours: "11h–20h", color: "bg-blue-200 text-blue-800" }, null, { name: "Mariage Dupont", hours: "15h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Paul R.", role: "Serveur", events: [null, null, null, { name: "Séminaire BNP", hours: "11h–20h", color: "bg-blue-200 text-blue-800" }, null, { name: "Mariage Dupont", hours: "15h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Sophie L.", role: "Serveur", events: [null, null, null, { name: "Séminaire BNP", hours: "11h–20h", color: "bg-blue-200 text-blue-800" }, null, { name: "Mariage Dupont", hours: "15h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Thomas B.", role: "Serveur", events: [null, null, null, null, null, { name: "Mariage Dupont", hours: "15h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Hugo V.", role: "Runner", events: [null, null, null, null, null, { name: "Mariage Dupont", hours: "6h–2h", color: "bg-brand-200 text-brand-800" }, null] },
    { name: "Léa F.", role: "Plonge", events: [null, null, null, null, null, { name: "Mariage Dupont", hours: "8h–2h", color: "bg-brand-200 text-brand-800" }, null] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Planning — Semaine du 17 mars 2025</h3>
        <div className="flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-brand-200"></span> Mariage Dupont</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-200"></span> Séminaire BNP</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-brand-100"></span> Préparation</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-medium text-slate-500 w-36">Membre</th>
              {days.map((d) => (
                <th key={d} className="text-center px-1 py-2 font-medium text-slate-500">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.name} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <span className="text-slate-800 font-medium">{s.name}</span>
                  <span className="text-[9px] text-slate-400 ml-1">{s.role}</span>
                </td>
                {s.events.map((e, i) => (
                  <td key={i} className="px-1 py-1.5 text-center">
                    {e ? (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${e.color}`}>
                        {e.name}
                        <span className="block text-[7px] opacity-75 font-normal">{e.hours}</span>
                      </span>
                    ) : (
                      <span className="text-slate-200">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex-1">
          <p className="text-xs text-amber-700 font-medium">⚠ Anniv. Martin (25 mars) — 2 serveurs manquent</p>
          <p className="text-[10px] text-amber-600">Besoin : 6 serveurs • Confirmés : 4 • <button className="underline font-medium">Voir dispos →</button></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex-1">
          <p className="text-xs text-emerald-700 font-medium">✓ Mariage Dupont — Complet</p>
          <p className="text-[10px] text-emerald-600">12/12 postes pourvus • Pas de conflit horaire</p>
        </div>
      </div>
    </div>
  );
}

function Equipe() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Équipe — 14 membres</h3>
        <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">+ Ajouter</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="text-left pb-2 font-medium">Nom</th>
              <th className="text-left pb-2 font-medium">Rôle</th>
              <th className="text-left pb-2 font-medium">Contrat</th>
              <th className="text-right pb-2 font-medium">Taux horaire</th>
              <th className="text-right pb-2 font-medium">Events ce mois</th>
              <th className="text-right pb-2 font-medium">Heures ce mois</th>
              <th className="text-right pb-2 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Lucas Martin", role: "Chef de cuisine", contrat: "CDI", taux: "28€/h", events: 8, heures: "142h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Jean Petit", role: "Second de cuisine", contrat: "CDI", taux: "22€/h", events: 7, heures: "126h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Amira Karim", role: "Second de cuisine", contrat: "CDI", taux: "22€/h", events: 6, heures: "108h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Marie Duval", role: "Chef de rang", contrat: "CDI", taux: "18€/h", events: 9, heures: "88h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Paul Rousseau", role: "Serveur", contrat: "Extra", taux: "15€/h", events: 5, heures: "48h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Sophie Leroy", role: "Serveur", contrat: "Extra", taux: "15€/h", events: 6, heures: "54h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Thomas Bernard", role: "Serveur", contrat: "Extra", taux: "15€/h", events: 4, heures: "36h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Claire Moreau", role: "Serveur", contrat: "Extra", taux: "15€/h", events: 3, heures: "28h", status: "Congé", statusColor: "bg-slate-100 text-slate-600" },
              { name: "Hugo Vasseur", role: "Runner", contrat: "Extra", taux: "12€/h", events: 6, heures: "52h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
              { name: "Léa Fournier", role: "Plonge", contrat: "Extra", taux: "12€/h", events: 5, heures: "44h", status: "Actif", statusColor: "bg-emerald-100 text-emerald-700" },
            ].map((m) => (
              <tr key={m.name} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <td className="py-2 text-slate-800 font-medium">{m.name}</td>
                <td className="py-2 text-slate-600">{m.role}</td>
                <td className="py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${m.contrat === "CDI" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>{m.contrat}</span></td>
                <td className="py-2 text-right text-slate-600">{m.taux}</td>
                <td className="py-2 text-right text-slate-600">{m.events}</td>
                <td className="py-2 text-right text-slate-600">{m.heures}</td>
                <td className="py-2 text-right"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.statusColor}`}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Disponibilites() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Disponibilités — Anniv. Martin (25 mars, 45 pers)</h3>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">⚠ 2 serveurs manquent</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Postes requis</h4>
          <div className="space-y-2">
            {[
              { role: "Chef de cuisine", besoin: 1, affecte: "Lucas M.", status: "ok" },
              { role: "Second", besoin: 1, affecte: "Jean P.", status: "ok" },
              { role: "Chef de rang", besoin: 1, affecte: "Marie D.", status: "ok" },
              { role: "Serveurs", besoin: 4, affecte: "Paul R., Sophie L.", status: "manque 2" },
              { role: "Runner", besoin: 1, affecte: "Hugo V.", status: "ok" },
              { role: "Plonge", besoin: 1, affecte: "Léa F.", status: "ok" },
            ].map((p) => (
              <div key={p.role} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                <div>
                  <span className="text-slate-800 font-medium">{p.role}</span>
                  <span className="text-slate-400 ml-1">(×{p.besoin})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px]">{p.affecte}</span>
                  {p.status === "ok" ? (
                    <span className="text-emerald-600 text-[10px] font-medium">✓</span>
                  ) : (
                    <span className="text-red-600 text-[10px] bg-red-50 px-1.5 py-0.5 rounded font-medium">{p.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Extras disponibles le 25 mars</h4>
          <div className="space-y-2">
            {[
              { name: "Thomas Bernard", role: "Serveur", dispo: true, note: "Disponible 17h-minuit" },
              { name: "Claire Moreau", role: "Serveur", dispo: false, note: "En congé" },
              { name: "Nadia S.", role: "Serveur (nouveau)", dispo: true, note: "Recommandé par Marie" },
              { name: "Marc D.", role: "Serveur (extra ponctuel)", dispo: true, note: "Libre toute la soirée" },
            ].map((e) => (
              <div key={e.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                <div>
                  <span className={`font-medium ${e.dispo ? "text-slate-800" : "text-slate-400"}`}>{e.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1">— {e.role}</span>
                  <p className="text-[10px] text-slate-400">{e.note}</p>
                </div>
                {e.dispo ? (
                  <button className="text-[10px] bg-brand-500 text-white px-2 py-1 rounded font-medium">Affecter</button>
                ) : (
                  <span className="text-[10px] text-slate-400">Indisponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenStaff() {
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
      {sub === 0 && <PlanningSemaine />}
      {sub === 1 && <Equipe />}
      {sub === 2 && <Disponibilites />}
    </div>
  );
}
