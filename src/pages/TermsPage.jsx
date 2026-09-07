import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PublicFooter from "../components/PublicFooter";

export default function TermsPage() {
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
        <h1 className="mb-2 text-3xl font-bold text-[#006547]">Conditions générales d'utilisation</h1>
        <p className="mb-10 text-sm text-[#6e7a72]">Dernière mise à jour : septembre 2026</p>
        
        <div className="prose-sellam space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">1. Objet</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Les présentes Conditions générales d'utilisation (ci-après les « CGU ») ont pour objet de définir les modalités et conditions dans lesquelles Sellam met à disposition son application de gestion de boutique auprès de ses utilisateurs, ainsi que les droits et obligations des parties dans ce cadre.
            </p>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Toute utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">2. Description du service</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam est une application destinée aux commerçants et gérants de boutique, leur permettant notamment de :
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Créer et gérer une ou plusieurs boutiques</li>
              <li>Gérer un inventaire de produits</li>
              <li>Enregistrer des ventes et générer des factures</li>
              <li>Inviter des employés à collaborer sur la gestion d'une boutique</li>
              <li>Souscrire à un abonnement payant</li>
              <li>Bénéficier d'un programme de parrainage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">3. Inscription et compte utilisateur</h2>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">3.1 Conditions d'inscription</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Pour utiliser l'Application, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. L'inscription est réservée aux personnes majeures.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">3.2 Sécurité du compte</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">3.3 Boutiques et employés</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Le créateur d'une boutique (gérant) peut inviter d'autres utilisateurs à rejoindre sa boutique en tant qu'employés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">4. Abonnement et paiement</h2>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">4.1 Période d'essai gratuite</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Chaque nouvelle boutique bénéficie d'une période d'essai gratuite.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">4.2 Abonnement payant</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              À l'issue de la période d'essai, un abonnement payant est nécessaire.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">4.3 Paiement</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Les paiements sont traités par CinetPay.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">4.4 Renouvellement et défaut de paiement</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              L'abonnement est renouvelable par un nouveau paiement. En l'absence de renouvellement, une période de grâce limitée est accordée.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">4.5 Absence de remboursement</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Les sommes versées ne sont pas remboursables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">5. Programme de parrainage</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam propose un programme de parrainage permettant à un utilisateur d'inviter un tiers à s'inscrire. Les modalités sont précisées dans l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">6. Obligations de l'Utilisateur</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">Vous vous engagez à :</p>
            <ul className="list-disc pl-6 space-y-1.5 text-[#3e4943]">
              <li>Fournir des informations exactes et à jour</li>
              <li>Utiliser l'Application conformément à sa destination et aux lois applicables</li>
              <li>Ne pas utiliser l'Application à des fins frauduleuses</li>
              <li>Ne pas tenter de contourner les mesures de sécurité</li>
              <li>Ne pas céder ou transférer votre compte sans accord préalable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">7. Propriété intellectuelle</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              L'Application et tous ses éléments sont la propriété exclusive de l'Éditeur. Vous conservez la propriété de vos données commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">8. Disponibilité du service</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam s'efforce d'assurer une disponibilité continue sans garantie d'accès ininterrompu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">9. Limitation de responsabilité</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam met en œuvre des moyens raisonnables pour assurer l'exactitude et la sécurité des données. L'Application est un outil de gestion et ne constitue pas un conseil professionnel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">10. Suspension et résiliation</h2>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">10.1 Par l'Utilisateur</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Vous pouvez cesser d'utiliser l'Application à tout moment.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">10.2 Par Sellam</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam peut suspendre ou résilier votre accès en cas de manquement aux CGU.
            </p>
            <h3 className="text-lg font-semibold text-[#3e4943] mb-2 mt-4">10.3 Effets de la résiliation</h3>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              En cas de résiliation, vous perdez l'accès à l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">11. Modification des CGU</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Sellam se réserve le droit de modifier les CGU à tout moment. Toute modification substantielle sera notifiée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#141e1a] mb-3">12. Droit applicable et litiges</h2>
            <p className="text-[#3e4943] leading-relaxed mb-3">
              Les parties s'efforceront de trouver une solution amiable avant toute action judiciaire.
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
