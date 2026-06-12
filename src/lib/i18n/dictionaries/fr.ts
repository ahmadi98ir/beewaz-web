import type { Dictionary } from './fa'

const fr: Dictionary = {
  common: {
    siteName: 'Beewaz', loading: 'Chargement...', error: 'Une erreur est survenue', retry: 'Réessayer',
    save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
    confirm: 'Confirmer', search: 'Rechercher', filter: 'Filtrer', all: 'Tous',
    yes: 'Oui', no: 'Non', back: 'Retour', next: 'Suivant',
    previous: 'Précédent', submit: 'Envoyer', close: 'Fermer',
  },
  nav: {
    home: 'Accueil', shop: 'Boutique', blog: 'Blog', about: 'À propos',
    contact: 'Contact', cart: 'Panier', profile: 'Profil', login: 'Connexion',
    logout: 'Déconnexion', dealers: 'Revendeurs', knowledge: 'Guide produit',
  },
  home: {
    heroTitle:          'Sécurité intelligente, tranquillité réelle',
    heroSubtitle:       'Systèmes d\'alarme, caméras de surveillance et contrôle d\'accès — avec les meilleures marques',
    heroCta:            'Voir les produits',
    categoriesTitle:    'Acheter par catégorie',
    categoriesSubtitle: 'Trouvez rapidement ce dont vous avez besoin',
    latestTitle:        'Derniers produits',
    latestSubtitle:     'Tout juste ajoutés à notre boutique',
    viewAll:            'Voir tout',
    noProducts:         'Aucun produit trouvé',
    noCategories:       'Aucune catégorie trouvée',
    trustBadges:        ['Installation gratuite', 'Garantie d\'authenticité', 'Support 24/7', 'Garantie 24 mois'],
  },
  product: {
    addToCart: 'Ajouter au panier', buyNow: 'Acheter', outOfStock: 'Rupture de stock', price: 'Prix',
    comparePrice: 'Prix d\'origine', discount: 'Réduction', sku: 'Référence', category: 'Catégorie',
    description: 'Description', specs: 'Caractéristiques', reviews: 'Avis', related: 'Produits similaires',
    inStock: 'En stock', freeShipping: 'Livraison gratuite',
  },
  cart: {
    title: 'Panier', empty: 'Votre panier est vide', total: 'Total', checkout: 'Commander',
    continueShopping: 'Continuer les achats', quantity: 'Qté', remove: 'Supprimer',
    shipping: 'Livraison', freeShipping: 'Livraison gratuite',
  },
  checkout: {
    title: 'Commande', address: 'Adresse de livraison', payment: 'Paiement', orderSummary: 'Récapitulatif',
    placeOrder: 'Passer la commande', province: 'Province', city: 'Ville', street: 'Rue',
    alley: 'Allée', plate: 'Numéro', unit: 'Appartement', postalCode: 'Code postal',
  },
  auth: {
    phone: 'Téléphone', otp: 'Code de vérification', sendOtp: 'Envoyer le code', verifyOtp: 'Vérifier',
    loginTitle: 'Connexion', otpSent: 'Code envoyé',
  },
  footer: {
    rights: 'Tous droits réservés', privacy: 'Confidentialité', terms: 'Conditions d\'utilisation',
  },
}

export default fr
