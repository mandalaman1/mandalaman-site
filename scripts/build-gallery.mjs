import fs from "node:fs";
import path from "node:path";

const dossiersPossibles = [
  "contenu/oeuvres",
  "content/oeuvres"
];

const dossierSource = dossiersPossibles.find(dossier =>
  fs.existsSync(dossier)
);

if (!dossierSource) {
  console.error("Dossier des œuvres introuvable.");
  process.exit(1);
}

function nettoyerValeur(valeur = "") {
  valeur = valeur.trim();

  if (
    (valeur.startsWith('"') && valeur.endsWith('"')) ||
    (valeur.startsWith("'") && valeur.endsWith("'"))
  ) {
    valeur = valeur.slice(1, -1);
  }

  if (valeur === "true") return true;
  if (valeur === "false") return false;

  return valeur;
}

function analyserFiche(contenu) {
  const donnees = {};
  const lignes = contenu.split(/\r?\n/);

  let listeEnCours = null;

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();

    if (!ligne || ligne === "---" || ligne.startsWith("#")) {
      continue;
    }

    /* élément d'une liste, par exemple photos_details */
    if (ligne.startsWith("- ") && listeEnCours) {
      donnees[listeEnCours].push(
        nettoyerValeur(ligne.slice(2))
      );
      continue;
    }

    const position = ligne.indexOf(":");

    if (position < 1) {
      continue;
    }

    const cle = ligne.slice(0, position).trim();
    const valeur = ligne.slice(position + 1).trim();

    /* clé suivie d'une liste */
    if (valeur === "") {
      donnees[cle] = [];
      listeEnCours = cle;
      continue;
    }

    listeEnCours = null;
    donnees[cle] = nettoyerValeur(valeur);
  }

  return donnees;
}

const fichiers = fs
  .readdirSync(dossierSource)
  .filter(fichier => /\.(md|yml|yaml)$/i.test(fichier))
  .sort();

const oeuvres = [];

for (const fichier of fichiers) {
  const chemin = path.join(dossierSource, fichier);

  const donnees = analyserFiche(
    fs.readFileSync(chemin, "utf8")
  );

  if (!donnees.titre) {
    continue;
  }

  oeuvres.push({
    titre: donnees.titre || "",
    technique: donnees.technique || "",
    dimensions: donnees.dimensions || "",
    annee: donnees.annee || "",
    prix: donnees.prix || "",
    vendu:
      donnees.vendu === true ||
      donnees.vendu === "true",

    photo_principale:
      donnees.photo_principale || "",

    photos_details:
      Array.isArray(donnees.photos_details)
        ? donnees.photos_details
        : [],

    description:
      donnees.description || ""
  });
}

fs.mkdirSync("data", {
  recursive: true
});

fs.writeFileSync(
  "data/oeuvres.json",
  JSON.stringify(oeuvres, null, 2),
  "utf8"
);

console.log(
  `Galerie générée : ${oeuvres.length} œuvre(s)`
);
