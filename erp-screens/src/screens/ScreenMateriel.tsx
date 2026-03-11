import { useState } from "react";

const SUB_TABS = ["Inventaire", "Réservations événements", "Alertes & commandes"] as const;

function Inventaire() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Inventaire matériel</h3>
        <div className="flex gap-2">
          <div className="flex gap-1 text-[10px]">
            {["Tout", "Mobilier", "Vaisselle", "Linge", "Cuisine"].map((f, i) => (
              <button key={f} className={`px-2 py-0.5 rounded-full ${i === 0 ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
          <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">+ Ajouter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="text-left pb-2 font-medium">Référence</th>
              <th className="text-left pb-2 font-medium">Catégorie</th>
              <th className="text-right pb-2 font-medium">Stock total</th>
              <th className="text-right pb-2 font-medium">Disponible</th>
              <th className="text-right pb-2 font-medium">Réservé</th>
              <th className="text-right pb-2 font-medium">En maintenance</th>
              <th className="text-right pb-2 font-medium">État</th>
            </tr>
          </thead>
          <tbody>
            {[
              { ref: "Tables rondes 10 places", cat: "Mobilier", total: 30, dispo: 12, reserve: 18, maint: 0, ok: true },
              { ref: "Tables rectangulaires 8p", cat: "Mobilier", total: 20, dispo: 14, reserve: 6, maint: 0, ok: true },
              { ref: "Chaises pliantes noires", cat: "Mobilier", total: 250, dispo: 45, reserve: 200, maint: 5, ok: true },
              { ref: "Nappes blanches 300cm", cat: "Linge", total: 40, dispo: 15, reserve: 20, maint: 5, ok: false },
              { ref: "Nappes noires 300cm", cat: "Linge", total: 30, dispo: 22, reserve: 8, maint: 0, ok: true },
              { ref: "Assiettes plates (lot 10)", cat: "Vaisselle", total: 25, dispo: 5, reserve: 20, maint: 0, ok: true },
              { ref: "Assiettes creuses (lot 10)", cat: "Vaisselle", total: 20, dispo: 8, reserve: 12, maint: 0, ok: true },
              { ref: "Verres à vin (lot 12)", cat: "Vaisselle", total: 22, dispo: 6, reserve: 16, maint: 0, ok: true },
              { ref: "Flûtes champagne (lot 12)", cat: "Vaisselle", total: 18, dispo: 2, reserve: 16, maint: 0, ok: false },
              { ref: "Réchauds professionnels", cat: "Cuisine", total: 8, dispo: 3, reserve: 5, maint: 0, ok: true },
              { ref: "Bacs GN inox 1/1", cat: "Cuisine", total: 40, dispo: 10, reserve: 28, maint: 2, ok: true },
              { ref: "Frigo camion", cat: "Cuisine", total: 2, dispo: 0, reserve: 2, maint: 0, ok: false },
            ].map((r) => (
              <tr key={r.ref} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                <td className="py-2 text-slate-800 font-medium">{r.ref}</td>
                <td className="py-2"><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{r.cat}</span></td>
                <td className="py-2 text-right text-slate-600">{r.total}</td>
                <td className={`py-2 text-right font-medium ${r.dispo <= 2 ? "text-red-600" : r.dispo <= 5 ? "text-amber-600" : "text-emerald-600"}`}>{r.dispo}</td>
                <td className="py-2 text-right text-slate-500">{r.reserve}</td>
                <td className="py-2 text-right text-slate-400">{r.maint || "—"}</td>
                <td className="py-2 text-right">
                  {r.ok ? (
                    <span className="text-emerald-500 text-[10px]">✓ OK</span>
                  ) : (
                    <span className="text-amber-600 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded font-medium">Stock bas</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsEvents() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Matériel réservé par événement</h3>

      <div className="space-y-4">
        {[
          {
            event: "Mariage Dupont — 22 mars — 180 pers",
            status: "Complet",
            statusColor: "bg-emerald-100 text-emerald-700",
            items: [
              { ref: "Tables rondes 10p", qty: 18, dispo: 30, ok: true },
              { ref: "Chaises pliantes noires", qty: 180, dispo: 250, ok: true },
              { ref: "Nappes blanches 300cm", qty: 20, dispo: 15, ok: false, note: "5 manquantes → location Loc'Events" },
              { ref: "Assiettes plates (lot 10)", qty: 20, dispo: 25, ok: true },
              { ref: "Verres à vin (lot 12)", qty: 16, dispo: 22, ok: true },
              { ref: "Flûtes champagne (lot 12)", qty: 16, dispo: 18, ok: true },
              { ref: "Réchauds pro", qty: 5, dispo: 8, ok: true },
              { ref: "Bacs GN 1/1", qty: 28, dispo: 40, ok: true },
              { ref: "Frigo camion", qty: 2, dispo: 2, ok: true },
            ],
          },
          {
            event: "Séminaire BNP — 24 mars — 60 pers",
            status: "Complet",
            statusColor: "bg-emerald-100 text-emerald-700",
            items: [
              { ref: "Tables rectangulaires 8p", qty: 6, dispo: 20, ok: true },
              { ref: "Chaises pliantes noires", qty: 60, dispo: 250, ok: true },
              { ref: "Nappes noires 300cm", qty: 8, dispo: 30, ok: true },
              { ref: "Assiettes creuses (lot 10)", qty: 7, dispo: 20, ok: true },
            ],
          },
        ].map((evt) => (
          <div key={evt.event} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-800">{evt.event}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${evt.statusColor}`}>{evt.status}</span>
            </div>
            <div className="space-y-1">
              {evt.items.map((item) => (
                <div key={item.ref} className="flex items-center justify-between text-[11px] border-b border-slate-50 pb-1">
                  <span className="text-slate-700">{item.ref}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">×{item.qty}</span>
                    <span className="text-slate-400 text-[10px]">(stock: {item.dispo})</span>
                    {item.ok ? (
                      <span className="text-emerald-600 text-[10px] w-28 text-right">✓ Réservé</span>
                    ) : (
                      <span className="text-amber-600 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded w-28 text-right">{item.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertesCommandes() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-800">Alertes matériel & locations externes</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">⚠ Alertes stock</h4>
          <div className="space-y-2">
            {[
              { ref: "Nappes blanches 300cm", stock: 15, besoin: 20, event: "Mariage Dupont (22 mars)", action: "Location 5 nappes" },
              { ref: "Flûtes champagne (lot 12)", stock: 18, besoin: 16, event: "Mariage Dupont", action: "OK mais 0 marge — prévoir achat" },
              { ref: "Frigo camion", stock: 2, besoin: 2, event: "Dupont + BNP même semaine", action: "Conflit si chevauchement — vérifier horaires" },
            ].map((a) => (
              <div key={a.ref} className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-800">{a.ref}</span>
                  <span className="text-[10px] text-red-600 font-medium">Stock: {a.stock} / Besoin: {a.besoin}</span>
                </div>
                <p className="text-[10px] text-slate-500">Pour : {a.event}</p>
                <p className="text-[10px] text-red-700 font-medium mt-1">→ {a.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">📦 Locations externes en cours</h4>
          <div className="space-y-2">
            {[
              { fournisseur: "Loc'Events Paris", items: "5 nappes blanches 300cm", event: "Mariage Dupont", date: "Livraison 21 mars 14h", prix: "75€ HT", status: "Confirmé" },
            ].map((l) => (
              <div key={l.fournisseur} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-800">{l.fournisseur}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{l.status}</span>
                </div>
                <p className="text-[10px] text-slate-600">{l.items}</p>
                <p className="text-[10px] text-slate-400">{l.event} • {l.date}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">{l.prix}</p>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">🔧 Maintenance</h4>
              <div className="space-y-1 text-[11px]">
                {[
                  { ref: "Nappes blanches ×5", reason: "Tachées — pressing", retour: "19 mars" },
                  { ref: "Chaises pliantes ×5", reason: "Pieds tordus — réparation", retour: "20 mars" },
                  { ref: "Bacs GN ×2", reason: "Bosselés — à remplacer", retour: "—" },
                ].map((m) => (
                  <div key={m.ref} className="flex items-center justify-between border-b border-slate-50 pb-1">
                    <div>
                      <span className="text-slate-700">{m.ref}</span>
                      <span className="text-slate-400 ml-1">— {m.reason}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Retour : {m.retour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenMateriel() {
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
      {sub === 0 && <Inventaire />}
      {sub === 1 && <ReservationsEvents />}
      {sub === 2 && <AlertesCommandes />}
    </div>
  );
}
