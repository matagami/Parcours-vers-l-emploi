import { Skill } from '../types';

export const skillsDatabase: { [key: string]: Skill[] } = {
  // Restauration
  'plongeur|dishwasher': [
    { name: 'Gestion du temps', description: 'Gérer plusieurs tâches simultanément dans un environnement rapide.' },
    { name: 'Travail d\'équipe', description: 'Collaborer avec le personnel de cuisine pour un service fluide.' },
    { name: 'Attention aux détails', description: 'Assurer une propreté et une hygiène impeccables.' },
    { name: 'Endurance physique', description: 'Capacité à travailler debout pendant de longues périodes.' },
    { name: 'Fiabilité', description: 'Être ponctuel et assidu pour assurer le bon fonctionnement de la cuisine.' },
  ],
  'serveur|serveuse|waiter|waitress': [
    { name: 'Service à la clientèle', description: 'Fournir une expérience client positive et mémorable.' },
    { name: 'Communication', description: 'Communiquer clairement avec les clients et le personnel.' },
    { name: 'Vente suggestive', description: 'Proposer des plats ou des boissons pour améliorer l\'expérience client.' },
    { name: 'Gestion du stress', description: 'Rester calme et efficace pendant les périodes de pointe.' },
    { name: 'Multitâche', description: 'Gérer plusieurs tables et demandes en même temps.' },
  ],
  'barista': [
    { name: 'Connaissance du café', description: 'Comprendre les différents types de café et méthodes de préparation.' },
    { name: 'Service à la clientèle', description: 'Accueillir les clients et prendre les commandes de manière amicale.' },
    { name: 'Rapidité d\'exécution', description: 'Préparer les boissons rapidement tout en maintenant la qualité.' },
    { name: 'Gestion de caisse', description: 'Traiter les paiements de manière précise.' },
    { name: 'Propreté', description: 'Maintenir un espace de travail propre et organisé.' },
  ],
  'cuisinier|cuisinière|cook': [
     { name: 'Préparation des aliments', description: 'Suivre des recettes pour préparer les plats selon les normes.' },
     { name: 'Sécurité alimentaire', description: 'Connaître et appliquer les normes d\'hygiène (MAPAQ).' },
     { name: 'Gestion de l\'inventaire', description: 'Aider à suivre les stocks et à minimiser le gaspillage.' },
     { name: 'Travail sous pression', description: 'Gérer les commandes efficacement pendant les heures de pointe.' },
     { name: 'Collaboration', description: 'Travailler en étroite collaboration avec les autres membres de la cuisine.' },
  ],

  // Commerce de détail
  'caissier|caissière|cashier': [
    { name: 'Gestion de caisse', description: 'Traiter les transactions (argent, débit, crédit) avec précision.' },
    { name: 'Service à la clientèle', description: 'Accueillir les clients et répondre à leurs questions.' },
    { name: 'Résolution de problèmes', description: 'Gérer les retours ou les problèmes de prix de manière professionnelle.' },
    { name: 'Fiabilité', description: 'Être ponctuel et digne de confiance avec la gestion de l\'argent.' },
    { name: 'Souci du détail', description: 'S\'assurer que les transactions sont correctes et que le tiroir-caisse balance.' },
  ],
  'commis d\'étalage|marchandiseur|stock clerk': [
    { name: 'Organisation', description: 'Placer les produits de manière logique et attrayante.' },
    { name: 'Gestion des stocks', description: 'Recevoir, déballer et vérifier la marchandise.' },
    { name: 'Autonomie', description: 'Travailler de manière indépendante pour maintenir les étagères pleines.' },
    { name: 'Rapidité', description: 'Remplir les tablettes rapidement pour assurer la disponibilité des produits.' },
    { name: 'Endurance physique', description: 'Soulever et déplacer des boîtes et des produits.' },
  ],
  'vendeur|vendeuse|sales associate': [
    { name: 'Conseil client', description: 'Aider les clients à trouver les produits qui répondent à leurs besoins.' },
    { name: 'Communication interpersonnelle', description: 'Établir une relation de confiance avec les clients.' },
    { name: 'Connaissance des produits', description: 'Apprendre et présenter les caractéristiques des produits.' },
    { name: 'Atteinte des objectifs', description: 'Travailler pour atteindre les objectifs de vente personnels et d\'équipe.' },
    { name: 'Présentation visuelle', description: 'Maintenir l\'apparence du magasin propre et attrayante.' },
  ],

  // Gardiennage et animation
  'gardien|gardienne|babysitter': [
    { name: 'Sens des responsabilités', description: 'Assurer la sécurité et le bien-être des enfants.' },
    { name: 'Patience', description: 'Gérer les comportements des enfants avec calme et compréhension.' },
    { name: 'Créativité', description: 'Organiser des activités amusantes et adaptées à l\'âge des enfants.' },
    { name: 'Premiers soins', description: 'Connaissances de base en premiers soins et en RCR (un atout).' },
    { name: 'Communication avec les parents', description: 'Faire un rapport clair aux parents sur le déroulement de la garde.' },
  ],
  'moniteur de camp|animatrice de camp|camp counselor': [
    { name: 'Leadership', description: 'Guider et motiver un groupe d\'enfants.' },
    { name: 'Animation de groupe', description: 'Planifier et diriger des jeux, des sports et des activités.' },
    { name: 'Gestion de conflits', description: 'Aider à résoudre les désaccords entre les enfants de manière constructive.' },
    { name: 'Énergie et enthousiasme', description: 'Créer une atmosphère positive et engageante.' },
    { name: 'Adaptabilité', description: 'Ajuster les plans en fonction de la météo ou de l\'humeur du groupe.' },
  ],
  
  // Autres
  'commis d\'entrepôt|warehouse worker': [
      { name: 'Manutention', description: 'Charger, décharger et déplacer des matériaux manuellement ou avec de l\'équipement.' },
      { name: 'Logistique', description: 'Préparer et emballer les commandes pour l\'expédition.' },
      { name: 'Souci de la sécurité', description: 'Respecter les normes de sécurité pour prévenir les accidents.' },
      { name: 'Précision', description: 'Vérifier l\'exactitude des commandes et des inventaires.' },
      { name: 'Travail d\'équipe', description: 'Coordonner avec les autres membres de l\'équipe pour respecter les délais.' },
  ]
};
