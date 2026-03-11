export function ScreenOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bonjour, Élise 👋</h2>
        <p className="text-sm text-slate-500">Semaine du 17 au 23 mars 2025 — 4 événements à venir</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Events cette semaine", value: "4", sub: "dont 1 mariage 180 pers", color: "text-brand-600" },
          { label: "CA signé (mars)", value: "87 400€", sub: "+23% vs fév.", color: "text-emerald-600" },
          { label: "Devis en attente", value: "3", sub: "12 400€ en jeu", color: "text-amber-600" },
          { label: "Marge moyenne", value: "32,4%", sub: "Objectif : 30%", color: "text-emerald-600" },
          { label: "Alertes actives", value: "2", sub: "Staff + matériel", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Linked data flow — one quote drives everything */}
      <div className="bg-white rounded-xl border border-brand-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Tout part du devis — données liées et à jour</h3>
            <p className="text-[11px] text-slate-400">Chaque modification se propage automatiquement à toutes les facettes du projet</p>
          </div>
          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-medium">Système connecté</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          {[
            { module: "Devis", icon: "📝", value: "6 devis actifs", detail: "16 776€ dernier signé", color: "border-brand-200 bg-brand-50" },
            { module: "Production", icon: "👨‍🍳", value: "4 fiches générées", detail: "52 ingrédients calculés", color: "border-emerald-200 bg-emerald-50" },
            { module: "Staff", icon: "👥", value: "12 postes planifiés", detail: "2 serveurs manquent", color: "border-blue-200 bg-blue-50" },
            { module: "Matériel", icon: "🍽", value: "18 réfs réservées", detail: "1 alerte stock", color: "border-purple-200 bg-purple-50" },
            { module: "Logistique", icon: "🚛", value: "Timeline 06h–02h", detail: "22 étapes planifiées", color: "border-orange-200 bg-orange-50" },
          ].map((m, i) => (
            <div key={m.module} className="flex items-center gap-1 flex-1">
              <div className={`rounded-lg border p-3 text-center w-full ${m.color}`}>
                <p className="text-lg">{m.icon}</p>
                <p className="text-[10px] font-bold text-slate-800 mt-1">{m.module}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">{m.value}</p>
                <p className="text-[8px] text-slate-400">{m.detail}</p>
              </div>
              {i < 4 && <span className="text-brand-400 font-bold text-xs shrink-0">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Events table */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Événements à venir</h3>
            <button className="text-[11px] text-brand-600 font-medium hover:underline">Voir tout →</button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="text-left pb-2 font-medium">Événement</th>
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-right pb-2 font-medium">Convives</th>
                <th className="text-right pb-2 font-medium">Montant</th>
                <th className="text-right pb-2 font-medium">Marge</th>
                <th className="text-right pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Mariage Dupont", lieu: "Hôtel Le Bristol", date: "22 mars", pax: 180, montant: "16 776€", marge: "32,8%", status: "Prêt", statusColor: "bg-emerald-100 text-emerald-700" },
                { name: "Séminaire BNP Paribas", lieu: "Tour Montparnasse", date: "24 mars", pax: 60, montant: "4 200€", marge: "35,1%", status: "Prêt", statusColor: "bg-emerald-100 text-emerald-700" },
                { name: "Anniversaire Martin", lieu: "Villa privée Neuilly", date: "25 mars", pax: 45, montant: "3 800€", marge: "29,4%", status: "2 serveurs manquent", statusColor: "bg-amber-100 text-amber-700" },
                { name: "Brunch Hermès", lieu: "Showroom Faubourg", date: "30 mars", pax: 80, montant: "6 400€", marge: "31,2%", status: "Prêt", statusColor: "bg-emerald-100 text-emerald-700" },
                { name: "Gala Fondation Cartier", lieu: "Palais Royal", date: "2 avril", pax: 250, montant: "28 500€", marge: "33,5%", status: "Devis envoyé", statusColor: "bg-blue-100 text-blue-700" },
              ].map((e) => (
                <tr key={e.name} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <td className="py-2.5">
                    <p className="text-slate-800 font-medium">{e.name}</p>
                    <p className="text-[10px] text-slate-400">{e.lieu}</p>
                  </td>
                  <td className="py-2.5 text-slate-600">{e.date}</td>
                  <td className="py-2.5 text-right text-slate-600">{e.pax}</td>
                  <td className="py-2.5 text-right text-slate-800 font-medium">{e.montant}</td>
                  <td className="py-2.5 text-right text-slate-600">{e.marge}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${e.statusColor}`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column: alerts + impact */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Alertes</h3>
            <div className="space-y-2">
              {[
                { icon: "👥", text: "Anniv. Martin — 2 serveurs manquent sur 6", action: "Voir dispos", severity: "amber" },
                { icon: "🍽", text: "Nappes blanches — stock 15/20 pour Mariage Dupont", action: "Commander", severity: "red" },
              ].map((a, i) => (
                <div key={i} className={`rounded-lg p-3 border ${a.severity === "red" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <p className="text-xs text-slate-700"><span className="mr-1">{a.icon}</span>{a.text}</p>
                  <button className={`text-[10px] font-semibold mt-1 ${a.severity === "red" ? "text-red-600" : "text-amber-600"}`}>{a.action} →</button>
                </div>
              ))}
            </div>
          </div>

          {/* Impact numbers */}
          <div className="bg-slate-900 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Impact Enobase</h3>
            <div className="space-y-3">
              {[
                { value: "÷5", label: "temps de création de devis" },
                { value: "−95%", label: "erreurs opérationnelles" },
                { value: "+34h", label: "récupérées par semaine" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xl font-bold text-emerald-400 w-14">{s.value}</span>
                  <span className="text-xs text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Achats à passer</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { fournisseur: "Boucherie Lenôtre", items: "35 kg filet boeuf", urgent: true },
                { fournisseur: "Marée du Jour", items: "14 kg saumon, 12 kg bar", urgent: true },
                { fournisseur: "Metro Cash", items: "18 kg pâte feuilletée, 8L crème", urgent: false },
              ].map((c) => (
                <div key={c.fournisseur} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                  <div>
                    <p className="text-slate-700 font-medium">{c.fournisseur}</p>
                    <p className="text-[10px] text-slate-400">{c.items}</p>
                  </div>
                  {c.urgent && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Urgent</span>}
                </div>
              ))}
              <button className="text-[11px] text-brand-600 font-medium mt-1">Générer les commandes →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
