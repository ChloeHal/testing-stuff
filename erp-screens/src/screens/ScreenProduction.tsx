import { useState } from "react";

const SUB_TABS = ["Fiches recettes", "Ingrédients consolidés", "Préparations du jour"] as const;

function FichesRecettes() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Fiches production</h3>
          <div className="flex gap-1 text-[10px]">
            {["Cette semaine", "Semaine prochaine", "Tout"].map((f, i) => (
              <button key={f} className={`px-2 py-0.5 rounded-full ${i === 0 ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: "Cocktail dînatoire — 1 440 pièces",
            event: "Mariage Dupont • 22 mars • 180 pers",
            items: [
              { name: "Mini tartares de thon", qty: "360 pcs", status: "ok" },
              { name: "Verrines avocat-crevettes", qty: "360 pcs", status: "ok" },
              { name: "Blinis saumon fumé", qty: "360 pcs", status: "ok" },
              { name: "Brochettes caprese", qty: "360 pcs", status: "ok" },
            ],
            totalIngredients: 12,
            prepTime: "J-1 : 6h de prep",
          },
          {
            title: "Entrée — Gravlax de saumon",
            event: "Mariage Dupont • 22 mars • 180 portions",
            items: [
              { name: "Saumon fumé maison", qty: "14 kg", status: "à commander" },
              { name: "Crème d'aneth", qty: "3,6 L", status: "ok" },
              { name: "Blinis de sarrasin", qty: "540 pcs (3/pers)", status: "ok" },
              { name: "Citron, câpres, oignon rouge", qty: "selon fiche", status: "ok" },
            ],
            totalIngredients: 6,
            prepTime: "J-2 : marinade 48h",
          },
          {
            title: "Filet de boeuf en croûte — 140 portions",
            event: "Mariage Dupont • 22 mars",
            items: [
              { name: "Filet de boeuf", qty: "35 kg", status: "à commander" },
              { name: "Pâte feuilletée", qty: "18 kg", status: "stock partiel (5 kg)" },
              { name: "Duxelles de champignons", qty: "7 kg", status: "ok" },
              { name: "Sauce Périgueux", qty: "8,4 L", status: "ok" },
            ],
            totalIngredients: 8,
            prepTime: "J-1 : saisir + monter croûtes",
          },
          {
            title: "Bar en papillote — 40 portions",
            event: "Mariage Dupont • 22 mars",
            items: [
              { name: "Bar de ligne", qty: "12 kg", status: "à commander" },
              { name: "Légumes primeur", qty: "6 kg", status: "ok" },
              { name: "Beurre blanc", qty: "2,4 L", status: "ok" },
              { name: "Papier cuisson, herbes", qty: "selon fiche", status: "ok" },
            ],
            totalIngredients: 7,
            prepTime: "Jour J : cuisson minute",
          },
        ].map((fiche) => (
          <div key={fiche.title} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 cursor-pointer transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">{fiche.title}</h4>
                <p className="text-[10px] text-slate-400">{fiche.event}</p>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{fiche.totalIngredients} ingrédients</span>
            </div>
            <div className="space-y-1 mb-2">
              {fiche.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[11px] border-b border-slate-50 pb-1">
                  <span className="text-slate-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.qty}</span>
                    {item.status === "ok" ? (
                      <span className="text-emerald-500 text-[9px]">✓</span>
                    ) : (
                      <span className="text-amber-600 text-[9px] bg-amber-50 px-1 rounded">{item.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-brand-600 font-medium">{fiche.prepTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IngredientsConsolides() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Ingrédients consolidés — Semaine du 17 mars</h3>
        <div className="flex gap-2">
          <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium">Exporter PDF</button>
          <button className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium">Générer commandes</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="text-left pb-2 font-medium">Ingrédient</th>
              <th className="text-left pb-2 font-medium">Catégorie</th>
              <th className="text-right pb-2 font-medium">Besoin total</th>
              <th className="text-right pb-2 font-medium">En stock</th>
              <th className="text-right pb-2 font-medium">À commander</th>
              <th className="text-left pb-2 font-medium pl-3">Fournisseur</th>
              <th className="text-right pb-2 font-medium">Coût estimé</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Filet de boeuf", cat: "Viande", besoin: "35 kg", stock: "12 kg", commander: "23 kg", fourn: "Boucherie Lenôtre", cout: "690€", urgent: true },
              { name: "Saumon fumé", cat: "Poisson", besoin: "14 kg", stock: "0", commander: "14 kg", fourn: "Marée du Jour", cout: "560€", urgent: true },
              { name: "Bar de ligne", cat: "Poisson", besoin: "12 kg", stock: "0", commander: "12 kg", fourn: "Marée du Jour", cout: "360€", urgent: true },
              { name: "Pâte feuilletée", cat: "Boulangerie", besoin: "18 kg", stock: "5 kg", commander: "13 kg", fourn: "Metro Cash", cout: "91€", urgent: false },
              { name: "Crème fraîche", cat: "Crémerie", besoin: "8 L", stock: "10 L", commander: "—", fourn: "—", cout: "—", urgent: false },
              { name: "Beurre AOP", cat: "Crémerie", besoin: "6 kg", stock: "8 kg", commander: "—", fourn: "—", cout: "—", urgent: false },
              { name: "Champignons de Paris", cat: "Légumes", besoin: "7 kg", stock: "2 kg", commander: "5 kg", fourn: "Rungis Direct", cout: "35€", urgent: false },
              { name: "Thon sushi", cat: "Poisson", besoin: "4,5 kg", stock: "0", commander: "4,5 kg", fourn: "Marée du Jour", cout: "180€", urgent: true },
              { name: "Avocat Hass", cat: "Légumes", besoin: "60 pcs", stock: "0", commander: "60 pcs", fourn: "Rungis Direct", cout: "120€", urgent: false },
              { name: "Crevettes décortiquées", cat: "Poisson", besoin: "5 kg", stock: "2 kg", commander: "3 kg", fourn: "Marée du Jour", cout: "105€", urgent: false },
            ].map((r) => (
              <tr key={r.name} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2 text-slate-800 font-medium">{r.name}</td>
                <td className="py-2 text-slate-400 text-[10px]">{r.cat}</td>
                <td className="py-2 text-right text-slate-600">{r.besoin}</td>
                <td className="py-2 text-right text-slate-400">{r.stock}</td>
                <td className="py-2 text-right">
                  {r.commander === "—" ? (
                    <span className="text-emerald-600 font-medium">✓ en stock</span>
                  ) : (
                    <span className={`font-medium ${r.urgent ? "text-red-600" : "text-amber-600"}`}>{r.commander}</span>
                  )}
                </td>
                <td className="py-2 text-slate-500 pl-3">{r.fourn}</td>
                <td className="py-2 text-right text-slate-600">{r.cout}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200">
              <td colSpan={4} className="pt-3 text-slate-800 font-bold text-xs">Total commandes à passer</td>
              <td className="pt-3 text-right text-slate-800 font-bold">8 lignes</td>
              <td className="pt-3 text-slate-500 pl-3">3 fournisseurs</td>
              <td className="pt-3 text-right text-slate-800 font-bold">2 141€</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[10px] text-slate-400">Consolidé automatiquement depuis les 4 events de la semaine. Mis à jour en temps réel si un devis change.</p>
    </div>
  );
}

function PreparationsJour() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Préparations — Vendredi 21 mars (J-1 Mariage Dupont)</h3>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">En cours</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="space-y-3">
          {[
            { time: "06:00", task: "Réception livraisons", detail: "Boucherie Lenôtre (35 kg boeuf) + Marée du Jour (14 kg saumon, 12 kg bar)", status: "done", assignee: "Lucas M." },
            { time: "07:00", task: "Contrôle qualité & stockage", detail: "Vérifier DLC, peser, stocker chambre froide", status: "done", assignee: "Lucas M." },
            { time: "08:00", task: "Découpe filets de boeuf", detail: "35 kg → 140 portions de 250g, parer, ficeler", status: "done", assignee: "Jean P." },
            { time: "08:00", task: "Préparation cocktail", detail: "Mini tartares (360 pcs), verrines (360 pcs) — montage", status: "in_progress", assignee: "Amira K." },
            { time: "09:30", task: "Duxelles de champignons", detail: "7 kg champignons → hachage, cuisson, assaisonnement", status: "in_progress", assignee: "Jean P." },
            { time: "10:00", task: "Montage boeuf en croûte", detail: "Saisir filets, enrouler duxelles + pâte feuilletée", status: "upcoming", assignee: "Lucas M. + Jean P." },
            { time: "11:00", task: "Préparation sauces", detail: "Sauce Périgueux (8,4L) + Beurre blanc (2,4L)", status: "upcoming", assignee: "Amira K." },
            { time: "14:00", task: "Blinis de sarrasin", detail: "540 pcs — cuisson en série", status: "upcoming", assignee: "Amira K." },
            { time: "15:00", task: "Pièce montée", detail: "Cuisson choux, caramel nougatine, montage", status: "upcoming", assignee: "Lucas M." },
            { time: "17:00", task: "Chargement camion", detail: "Tout en bacs GN, vérifier checklist matériel", status: "upcoming", assignee: "Tous" },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="text-slate-400 font-mono w-12 shrink-0 pt-0.5">{t.time}</span>
              <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                t.status === "done" ? "bg-emerald-500" : t.status === "in_progress" ? "bg-brand-500 animate-pulse" : "bg-slate-200"
              }`} />
              <div className="flex-1 border-b border-slate-50 pb-2">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${t.status === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>{t.task}</span>
                  <span className="text-[10px] text-slate-400">{t.assignee}</span>
                </div>
                <p className="text-[10px] text-slate-400">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScreenProduction() {
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
      {sub === 0 && <FichesRecettes />}
      {sub === 1 && <IngredientsConsolides />}
      {sub === 2 && <PreparationsJour />}
    </div>
  );
}
