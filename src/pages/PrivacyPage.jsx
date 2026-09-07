import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PublicFooter from "../components/PublicFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f1fcf5] text-[#141e1a]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#bdc9c1] bg-[#f1fcf5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-5">
          <Link to="/" className="flex items-center gap-2 text-[#006547] hover:text-[#12805c]">
            <ArrowLeft size={18} />
            <span className="font-display text-lg font-bold">Sellam</span>
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-[#006547]">Politique de confidentialité</h1>
        <p className="mb-10 text-sm text-[#6e7a72]">Dernière mise à jour : septembre 2026</p>
        
        <div className="prose-sellam space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">1. Introduction</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              La présente Politique décrit comment Sellam collecte, utilise, conserve et protège les données personnelles des utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">2. Données que nous collectons</h2>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">2.1 Données fournies directement par vous:</h3>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Données d'identification : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Données d'authentification : mot de passe chiffré ou identifiant Google</li>
              <li>Données relatives à votre boutique : nom commercial, adresse, logo</li>
              <li>Données relatives à votre activité commerciale : produits, ventes, factures</li>
              <li>Données de paiement d'abonnement : traitées par Sellam</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">2.2 Données collectées automatiquement:</h3>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Données techniques : adresse IP, type d'appareil, système d'exploitation</li>
              <li>Données d'usage : fonctionnalités utilisées, fréquence</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">2.3 Données de tiers:</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Si vous êtes invité comme employé, votre nom et contact peuvent être fournis par l'invitant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">3. Finalités du traitement</h2>
            <ol className="list-decimal pl-6 space-y-1.5 text-[#3e4943] mb-3">
              <li>Fourniture du service</li>
              <li>Gestion de l'abonnement</li>
              <li>Programme de parrainage</li>
              <li>Communication (notifications, rappels)</li>
              <li>Sécurité</li>
              <li>Amélioration du service</li>
              <li>Conformité légale</li>
            </ol>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Nous ne vendons pas vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">4. Base légale du traitement</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>L'exécution du contrat</li>
              <li>Votre consentement</li>
              <li>Notre intérêt légitime</li>
              <li>Le respect d'obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">5. Partage des données avec des tiers</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">Nous partageons vos données uniquement avec :</p>
            
            <div className="overflow-x-auto rounded-lg border border-[#bdc9c1] mt-4 mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[#ebf6ef]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[#141e1a]">Prestataire</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#141e1a]">Fonction</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#141e1a]">Données concernées</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bdc9c1]">
                  <tr className="bg-white">
                    <td className="px-4 py-3 text-[#3e4943]">Supabase</td>
                    <td className="px-4 py-3 text-[#3e4943]">Hébergement base de données</td>
                    <td className="px-4 py-3 text-[#3e4943]">Données utilisateurs et métier</td>
                  </tr>
                  <tr className="bg-[#f1fcf5]">
                    <td className="px-4 py-3 text-[#3e4943]">Google OAuth</td>
                    <td className="px-4 py-3 text-[#3e4943]">Authentification</td>
                    <td className="px-4 py-3 text-[#3e4943]">Email, Nom, Prénom</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-3 text-[#3e4943]">Sellam</td>
                    <td className="px-4 py-3 text-[#3e4943]">Paiements</td>
                    <td className="px-4 py-3 text-[#3e4943]">Informations de paiement</td>
                  </tr>
                  <tr className="bg-[#f1fcf5]">
                    <td className="px-4 py-3 text-[#3e4943]">Railway</td>
                    <td className="px-4 py-3 text-[#3e4943]">Hébergement infrastructure</td>
                    <td className="px-4 py-3 text-[#3e4943]">Logs, données techniques</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">6. Durée de conservation</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Pendant la durée d'utilisation active du compte</li>
              <li>Après clôture, selon les obligations légales applicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">7. Sécurité des données</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">Mesures mises en œuvre :</p>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Chiffrement des mots de passe</li>
              <li>Authentification par jeton sécurisé (JWT)</li>
              <li>Contrôle d'accès basé sur les rôles</li>
              <li>Hébergement sécurisé</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">8. Vos droits</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit d'opposition</li>
              <li>Droit à la portabilité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">9. Transferts internationaux de données</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Certains prestataires peuvent traiter vos données hors de votre pays de résidence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">10. Mineurs</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              L'Application est destinée aux utilisateurs majeurs. Nous ne collectons pas sciemment de données de mineurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">11. Cookies et technologies similaires</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              L'Application utilise des identifiants de session strictement nécessaires. Pas de cookies publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">12. Modification de la présente Politique</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Nous pouvons modifier cette Politique. Les modifications substantielles seront notifiées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">13. Contact</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Pour toute question : univerzcompany@gmail.com
            </p>
          </section>
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}
