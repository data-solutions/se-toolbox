import { Language } from '../types';

interface Translations {
  // Navigation
  newConversation: string;
  settings: string;
  switchTheme: string;
  
  // Chat
  you: string;
  assistant: string;
  thinking: string;
  askQuestion: string;
  addFiles: string;
  sendInstructions: string;
  
  // Welcome
  welcomeTitle: string;
  welcomeDescription: 'Your specialized retail AI assistant. Ask your business questions and upload Excel/CSV files to get personalized analysis.',
  analyzeSalesData: string;
  insightsProspects: string;
  salesStrategy: string;
  suggestionsStart: string;
  
  // File upload
  addExcelCsv: string;
  onlyExcelCsv: string;
  
  // Prompts
  analyzeTender: string;
  analyzeTenderDesc: string;
  analyzeTenderPrompt: string;
  productQuestion: string;
  productQuestionDesc: string;
  productQuestionPrompt: string;
  analyzeDomains: string;
  analyzeDomainsDesc: string;
  analyzeDomainsPrompt: string;
  riCoverage: string;
  riCoverageDesc: string;
  riCoveragePrompt: string;
  
  // Domain crawling analysis
  // Store Collector
  storeCollector: string;
  storeCollectorDesc: string;
  collectStores: string;
  manualInput: string;
  websiteScraping: string;
  brandSearch: string;
  addRetailers: string;
  retailersPlaceholder: string;
  retailersToCollect: string;
  websiteUrl: string;
  websiteUrlPlaceholder: string;
  websiteUrlDesc: string;
  brandName: string;
  brandNamePlaceholder: string;
  brandNameDesc: string;
  startCollection: string;
  collectionInProgress: string;
  collectionResults: string;
  collections: string;
  storesCollected: string;
  completedCollections: string;
  inProgress: string;
  citiesCovered: string;
  noCollectionStarted: string;
  useOptionsAbove: string;
  exportStores: string;
  refresh: string;
  stores: string;
  processed: string;
  pending: string;
  processing: string;
  completed: string;
  statusError: string;
  cards: string;
  list: string;
  noStoresCollected: string;
  collectionNotStarted: string;
  
  // Domain crawling analysis
  
  // Domain crawling analysis
  analyzeDomainsCrawling: 'Analizar dominios',
  analyzeDomainsCrawlingDesc: 'Analizar dominios para estimar nuestra capacidad de crawling/matching',
  analyzeDomainsCrawlingPrompt: 'Necesito analizar la siguiente lista de sitios/dominios. Debes indicarme si hay protecciones anti-bot en su lugar y si es así, cuáles. También debes estimar la facilidad de crawling/matching basándote en criterios técnicos que conoces.',
  
  // Errors
  errorOccurred: string;
  communicationError: string;
  
  // Categories
  analysis: string;
  strategy: string;
  prospecting: string;
  reporting: string;
  
  // Authentication
  login: string;
  email: string;
  password: string;
  rememberMe: string;
  forgotPassword: string;
  loginInProgress: string;
  loginError: string;
  noAccount: string;
  contactAdmin: string;
  termsAndConditions: string;
  privacyPolicy: string;
  byLoggingIn: string;
  showPassword: string;
  hidePassword: string;
  
  // App Layout
  chat: string;
  administration: string;
  search: string;
  notifications: string;
  myProfile: string;
  logout: string;
  
  // Admin Dashboard
  dashboard: string;
  platformOverview: string;
  export: string;
  newReport: string;
  totalUsers: string;
  activeUsers: string;
  availableRoles: string;
  administrators: string;
  vsLastMonth: string;
  recentActivity: string;
  alerts: string;
  quickActions: string;
  newUsersThisWeek: string;
  connectionsToday: string;
  rolesUpdated: string;
  inactiveAccounts30Days: string;
  expiredSession: string;
  createUser: string;
  exportData: string;
  managePermissions: string;
  
  // User Management
  userManagement: string;
  usersTotal: string;
  manageRoles: string;
  newUser: string;
  searchByName: string;
  allRoles: string;
  user: string;
  role: string;
  status: string;
  lastLogin: string;
  createdOn: string;
  actions: string;
  active: string;
  inactive: string;
  never: string;
  edit: string;
  activate: string;
  deactivate: string;
  noUsersFound: string;
  tryModifyingSearch: string;
  
  // User Modal
  editUser: string;
  username: string;
  fullName: string;
  selectRole: string;
  cancel: string;
  update: string;
  create: string;
  
  // Role Modal
  roleManagement: string;
  availableRoles2: string;
  description: string;
  permissions: string;
  information: string;
  permissionsInfo: string;
  selectRoleToView: string;
  close: string;
  
  // Welcome messages
  welcomeToWiser: string;
  specializedRetailAI: string;
  
  // Copy functionality
  copyResponse: string;
  copied: string;
  close: string;
  
  // Domain Checker status
  domainCheckStatusError: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    newConversation: 'New conversation',
    settings: 'Settings',
    switchTheme: 'Switch to {theme} theme',
    
    // Chat
    you: 'You',
    assistant: 'Pre-sales AI assistant',
    thinking: 'The assistant is thinking...',
    askQuestion: 'Ask your sales question...',
    addFiles: 'Add files',
    sendInstructions: 'Press Enter to send, Shift + Enter for new line',
    
    // Welcome
    welcomeTitle: 'Pre-sales AI assistant',
    welcomeDescription: 'Your specialized sales AI assistant. Ask your sales questions and upload Excel/CSV files to get personalized analysis.',
    suggestionsStart: 'Suggestions to get started',
    
    // File upload
    addExcelCsv: 'Add Excel/CSV file',
    onlyExcelCsv: 'Only Excel (.xlsx, .xls) and CSV files are allowed',
    
    // Prompts
    analyzeTender: 'Assessment Profile Assistant',
    analyzeTenderDesc: 'Analyze a tender to identify opportunities and risks',
    analyzeTenderPrompt: 'Can you analyze this tender? I will upload the document so you can help me identify opportunities, risks and the optimal response strategy.',
    productQuestion: 'Product question?',
    productQuestionDesc: 'Get detailed information about your products and solutions',
    productQuestionPrompt: 'I have a question about one of our products/solutions. Can you help me understand its features, competitive advantages and use cases?',
    analyzeDomains: 'Analyze domain list',
    analyzeDomainsDesc: 'Analyze a list of web domains to identify prospects',
    analyzeDomainsPrompt: 'Can you analyze this list of web domains? I will upload the file so you can help me identify prospect companies, their industry sector and commercial potential.',
    riCoverage: 'Know RI coverage rate',
    riCoverageDesc: 'Calculate and analyze your influence network coverage rate',
    riCoveragePrompt: 'Help me calculate and analyze my influence network (RI) coverage rate. I will share my data to evaluate our territorial presence.',
    
    // Domain crawling analysis
    analyzeDomainsCrawling: 'Analyze domains',
    analyzeDomainsCrawlingDesc: 'Analyze domains to estimate our ability to crawl/match them',
    analyzeDomainsCrawlingPrompt: 'I need to analyze the following list of sites/domains. You must tell me if anti-bot protections are in place and if so, which ones. You must also estimate the ease of crawling/matching based on technical criteria you know.',
    
    // Errors
    errorOccurred: 'An error occurred',
    communicationError: 'Unable to communicate with AI agent. Please try again.',
    
    // Categories
    analysis: 'Analysis',
    strategy: 'Strategy',
    prospecting: 'Prospecting',
    reporting: 'Reporting',
    
    // Authentication
    login: 'Login',
    email: 'Email address',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginInProgress: 'Logging in...',
    loginError: 'Login error',
    noAccount: 'No account yet?',
    contactAdmin: 'Contact your administrator',
    termsAndConditions: 'terms of use',
    privacyPolicy: 'privacy policy',
    byLoggingIn: 'By logging in, you accept our',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    
    // App Layout
    chat: 'Chat',
    administration: 'Administration',
    search: 'Search...',
    notifications: 'Notifications',
    myProfile: 'My profile',
    logout: 'Logout',
    
    // Admin Dashboard
    dashboard: 'Dashboard',
    platformOverview: 'Platform overview',
    export: 'Export',
    newReport: 'New report',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    availableRoles: 'Available roles',
    administrators: 'Administrators',
    vsLastMonth: 'vs last month',
    recentActivity: 'Recent activity',
    alerts: 'Alerts',
    quickActions: 'Quick actions',
    newUsersThisWeek: 'new users this week',
    connectionsToday: 'connections today',
    rolesUpdated: 'roles updated',
    inactiveAccounts30Days: 'inactive accounts for 30 days',
    expiredSession: 'expired session',
    createUser: 'Create user',
    exportData: 'Export data',
    managePermissions: 'Manage permissions',
    
    // User Management
    userManagement: 'User management',
    usersTotal: 'users total',
    manageRoles: 'Manage roles',
    newUser: 'New user',
    searchByName: 'Search by name, email...',
    allRoles: 'All roles',
    user: 'User',
    role: 'Role',
    status: 'Status',
    connectionCount: 'Connections',
    lastLogin: 'Last login',
    createdOn: 'Created on',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    never: 'Never',
    activeUser: 'Active',
    regularUser: 'Regular',
    newUser: 'New',
    edit: 'Edit',
    activate: 'Activate',
    deactivate: 'Deactivate',
    noUsersFound: 'No users found',
    tryModifyingSearch: 'Try modifying your search criteria.',
    
    // User Modal
    editUser: 'Edit user',
    username: 'Username',
    fullName: 'Full name',
    selectRole: 'Select a role',
    cancel: 'Cancel',
    update: 'Update',
    create: 'Create',
    error: 'Error',
    
    // Role Modal
    roleManagement: 'Role management',
    availableRoles2: 'Available roles',
    description: 'Description',
    permissions: 'Permissions',
    information: 'Information',
    permissionsInfo: 'Permissions are defined at the database level and can only be modified by a system administrator.',
    selectRoleToView: 'Select a role to view its details',
    close: 'Close',
    
    // Welcome messages
    welcomeToWiser: 'Welcome to The SE toolbox',
    specializedRetailAI: 'Your complete toolbox for Sales Engineers with AI assistant and analysis tools',
    
    // Copy functionality
    copyResponse: 'Copy response',
    copied: 'Copied',
    close: 'Close',
    
    // Domain Checker
    domainChecker: 'Domain Checker',
    domainCheckerDesc: 'Analyze domains and check their compatibility with our systems',
    
    // Store Collector
    storeCollector: 'Store List Collector',
    storeCollectorDesc: 'Collect and analyze store lists for your prospects',
    collectStores: 'Collect stores',
    generateMockData: 'Generate Mock Data',
    mapView: 'Map View',
    storeLocations: 'Store Locations',
    centerMap: 'Center Map',
    fullscreen: 'Fullscreen',
    noLocationsToDisplay: 'No locations to display',
    storesNeedCoordinates: 'Stores need coordinates to be displayed on the map',
    clickMarkersForDetails: 'Click markers for details',
    poweredByOpenStreetMap: 'Powered by OpenStreetMap',
    manualInput: 'Manual Input',
    websiteScraping: 'Website Scraping',
    brandSearch: 'Brand Search',
    addRetailers: 'Add retailers',
    retailersPlaceholder: 'Enter retailers (one per line)\nCarrefour, FR, carrefour.fr\nAuchan, FR\nTesco; GB; tesco.com\nWalmart, US, walmart.com',
    retailersToCollect: 'Retailers to collect',
    websiteUrl: 'Website URL',
    websiteUrlPlaceholder: 'https://example.com/stores',
    websiteUrlDesc: 'The tool will automatically analyze the page to extract store information',
    brandName: 'Brand name',
    brandNamePlaceholder: 'Ex: McDonald\'s, Zara, H&M...',
    brandNameDesc: 'Automatic search for stores of this brand via APIs and public databases',
    startCollection: 'Start collection',
    collectionInProgress: 'Collection in progress...',
    collectionResults: 'Collection results',
    collections: 'collections',
    storesCollected: 'Stores collected',
    completedCollections: 'Completed collections',
    inProgress: 'In progress',
    citiesCovered: 'Cities covered',
    noCollectionStarted: 'No collection started',
    useOptionsAbove: 'Use the options above to start collecting stores.',
    exportStores: 'Export stores',
    refresh: 'Refresh',
    stores: 'stores',
    processed: 'processed',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    statusError: 'Error',
    cards: 'Cards',
    list: 'List',
    noStoresCollected: 'No stores collected',
    collectionNotStarted: 'Collection has not started yet or no results found.',
    
    ecommercePlatform: 'E-commerce Platform',
    platformDetected: 'Platform detected',
    noPlatformDetected: 'No platform detected',
    confidence: 'Confidence',
    indicators: 'Indicators',
    version: 'Version',
    platformAnalysis: 'Platform analysis',
    inputMethod: 'Input Method',
    manualInput: 'Manual Input',
    domainList: 'Domain list',
    salesforceAP: 'Salesforce AP',
    apNumber: 'AP Number',
    addDomains: 'Add domains',
    domainsPlaceholder: 'Enter domains (one per line)\nexample.com\nanothersite.fr\nshop.net',
    domainsToCheck: 'Domains to check',
    salesforceAPNumber: 'Salesforce AP Number',
    salesforceAPPlaceholder: 'Ex: AP-003399 or 3399',
    salesforceAPDesc: 'Domains associated with this AP will be automatically retrieved from Salesforce',
    startVerification: 'Start verification',
    verificationInProgress: 'Verification in progress...',
    verificationResults: 'Verification results',
    domains: 'domains',
    exportCSV: 'Export CSV',
    checking: 'Checking...',
    domainCheckStatusError: 'Error',
    botBlockers: 'Bot Blockers',
    crawlStatus: 'Crawl Status',
    clientUsage: 'Client Usage',
    productIdentifiers: 'Product Identifiers',
    eanResponsive: 'EAN Responsive Test',
    severity: 'Severity',
    noBotBlockersDetected: 'No bot blockers detected',
    crawled: 'Crawled',
    notCrawled: 'Not crawled',
    lastCrawl: 'Last crawl',
    clients: 'client(s)',
    coverage: 'Coverage',
    searchForm: 'Form',
    found: 'Found',
    notFound: 'Not found',
    testDetails: 'Test details',
    retrievingDomains: 'Retrieving domains from Salesforce AP...',
    domainProfile: 'Domain Profile',
    profileType: 'Profile Type',
    brandSite: 'Brand Site',
    ecommerceSite: 'E-commerce Site',
    marketplace: 'Marketplace',
    unknownProfile: 'Unknown Profile',
    brandName: 'Brand Name',
    marketplaceType: 'Marketplace Type'
  },
  
  fr: {
    // Navigation
    newConversation: 'Nouvelle conversation',
    settings: 'Paramètres',
    switchTheme: 'Passer au thème {theme}',
    
    // Chat
    you: 'Vous',
    assistant: 'Assistant IA commercial',
    thinking: 'L\'assistant réfléchit...',
    askQuestion: 'Posez votre question commerciale...',
    addFiles: 'Ajouter des fichiers',
    sendInstructions: 'Appuyez sur Entrée pour envoyer, Shift + Entrée pour un saut de ligne',
    
    // Welcome
    welcomeTitle: 'Assistant IA Wiser',
    welcomeDescription: 'Votre assistant IA spécialisé en vente. Posez vos questions commerciales et uploadez vos fichiers Excel/CSV pour obtenir des analyses personnalisées.',
    suggestionsStart: 'Suggestions pour commencer',
    
    // File upload
    addExcelCsv: 'Ajouter fichier Excel/CSV',
    onlyExcelCsv: 'Seuls les fichiers Excel (.xlsx, .xls) et CSV sont autorisés',
    
    // Prompts
    analyzeTender: 'Analyser un appel d\'offres',
    analyzeTenderDesc: 'Analyser un appel d\'offres pour identifier les opportunités et risques',
    analyzeTenderPrompt: 'Peux-tu analyser cet appel d\'offres ? Je vais uploader le document pour que tu m\'aides à identifier les opportunités, risques et la stratégie de réponse optimale.',
    analyzeDomainsCrawling: 'Analyser des domaines',
    analyzeDomainsCrawlingDesc: 'Analyser des domaines pour estimer notre capacité à les crawler / matcher',
    analyzeDomainsCrawlingPrompt: 'J\'ai besoin d\'analyser la liste des sites / domaines suivants, tu dois m\'indiquer si des protections antibots sont en place et si oui lesquelles, tu dois également estimer la facilité de crawling / matching en fonction de critères techniques que tu connais.',
    productQuestion: 'Question produit ?',
    productQuestionDesc: 'Obtenir des informations détaillées sur vos produits et solutions',
    productQuestionPrompt: 'J\'ai une question sur un de nos produits/solutions. Peux-tu m\'aider à comprendre ses fonctionnalités, avantages concurrentiels et cas d\'usage ?',
    analyzeDomains: 'Analyser liste de domaines',
    analyzeDomainsDesc: 'Analyser une liste de domaines web pour identifier des prospects',
    analyzeDomainsPrompt: 'Peux-tu analyser cette liste de domaines web ? Je vais uploader le fichier pour que tu m\'aides à identifier les entreprises prospects, leur secteur d\'activité et potentiel commercial.',
    riCoverage: 'Connaître taux couverture RI',
    riCoverageDesc: 'Calculer et analyser votre taux de couverture réseau d\'influence',
    riCoveragePrompt: 'Aide-moi à calculer et analyser mon taux de couverture réseau d\'influence (RI). Je vais partager mes données pour évaluer notre présence territoriale.',
    communicationError: 'Impossible de communiquer avec l\'agent IA. Veuillez réessayer.',
    
    // Categories
    analysis: 'Analyse',
    strategy: 'Stratégie',
    prospecting: 'Prospection',
    reporting: 'Reporting',
    
    // Authentication
    login: 'Connexion',
    email: 'Adresse email',
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    loginInProgress: 'Connexion en cours...',
    loginError: 'Erreur de connexion',
    noAccount: 'Pas encore de compte ?',
    contactAdmin: 'Contactez votre administrateur',
    termsAndConditions: 'conditions d\'utilisation',
    privacyPolicy: 'politique de confidentialité',
    byLoggingIn: 'En vous connectant, vous acceptez nos',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    
    // App Layout
    chat: 'Chat',
    administration: 'Administration',
    search: 'Rechercher...',
    notifications: 'Notifications',
    myProfile: 'Mon profil',
    logout: 'Déconnexion',
    
    // Admin Dashboard
    dashboard: 'Tableau de bord',
    platformOverview: 'Vue d\'ensemble de votre plateforme',
    export: 'Exporter',
    newReport: 'Nouveau rapport',
    totalUsers: 'Utilisateurs totaux',
    activeUsers: 'Utilisateurs actifs',
    availableRoles: 'Rôles disponibles',
    administrators: 'Administrateurs',
    vsLastMonth: 'vs mois dernier',
    recentActivity: 'Activité récente',
    alerts: 'Alertes',
    quickActions: 'Actions rapides',
    newUsersThisWeek: 'nouveaux utilisateurs cette semaine',
    connectionsToday: 'connexions aujourd\'hui',
    rolesUpdated: 'rôles mis à jour',
    inactiveAccounts30Days: 'comptes inactifs depuis 30 jours',
    expiredSession: 'session expirée',
    createUser: 'Créer un utilisateur',
    exportData: 'Exporter les données',
    managePermissions: 'Gérer les permissions',
    
    // User Management
    userManagement: 'Gestion des utilisateurs',
    usersTotal: 'utilisateurs au total',
    manageRoles: 'Gérer les rôles',
    newUser: 'Nouvel utilisateur',
    searchByName: 'Rechercher par nom, email...',
    allRoles: 'Tous les rôles',
    user: 'Utilisateur',
    role: 'Rôle',
    status: 'Statut',
    connectionCount: 'Connexions',
    lastLogin: 'Dernière connexion',
    createdOn: 'Créé le',
    actions: 'Actions',
    active: 'Actif',
    inactive: 'Inactif',
    never: 'Jamais',
    activeUser: 'Actif',
    regularUser: 'Régulier',
    newUser: 'Nouveau',
    edit: 'Modifier',
    activate: 'Activer',
    deactivate: 'Désactiver',
    noUsersFound: 'Aucun utilisateur trouvé',
    tryModifyingSearch: 'Essayez de modifier vos critères de recherche.',
    
    // User Modal
    editUser: 'Modifier l\'utilisateur',
    username: 'Nom d\'utilisateur',
    fullName: 'Nom complet',
    selectRole: 'Sélectionner un rôle',
    cancel: 'Annuler',
    update: 'Mettre à jour',
    create: 'Créer',
    statusError: 'Erreur',
    
    // Role Modal
    roleManagement: 'Gestion des rôles',
    availableRoles2: 'Rôles disponibles',
    description: 'Description',
    permissions: 'Permissions',
    information: 'Information',
    permissionsInfo: 'Les permissions sont définies au niveau de la base de données et ne peuvent être modifiées que par un administrateur système.',
    selectRoleToView: 'Sélectionnez un rôle pour voir ses détails',
    close: 'Fermer',
    
    // Welcome messages
    welcomeToWiser: 'Bienvenue sur The SE toolbox',
    specializedRetailAI: 'Votre boîte à outils complète pour Sales Engineers avec assistant IA et outils d\'analyse',
    
    // Copy functionality
    copyResponse: 'Copier la réponse',
    copied: 'Copié',
    close: 'Fermer',
    
    // Domain Checker
    domainChecker: 'Domain Checker',
    domainCheckerDesc: 'Analysez les domaines et vérifiez leur compatibilité avec nos systèmes',
    
    // Store Collector
    storeCollector: 'Store List Collector',
    storeCollectorDesc: 'Collectez et analysez les listes de magasins pour vos prospects',
    collectStores: 'Collecter des magasins',
    generateMockData: 'Générer des données factices',
    mapView: 'Vue carte',
    storeLocations: 'Emplacements des magasins',
    centerMap: 'Centrer la carte',
    fullscreen: 'Plein écran',
    noLocationsToDisplay: 'Aucun emplacement à afficher',
    storesNeedCoordinates: 'Les magasins ont besoin de coordonnées pour être affichés sur la carte',
    clickMarkersForDetails: 'Cliquez sur les marqueurs pour les détails',
    poweredByOpenStreetMap: 'Propulsé par OpenStreetMap',
    manualInput: 'Saisie manuelle',
    websiteScraping: 'Scraping web',
    brandSearch: 'Recherche par marque',
    addRetailers: 'Ajouter des retailers',
    retailersPlaceholder: 'Saisissez les retailers (un par ligne)\nCarrefour, FR, carrefour.fr\nAuchan, FR\nTesco; GB; tesco.com\nWalmart, US, walmart.com',
    retailersToCollect: 'Retailers à collecter',
    websiteUrl: 'URL du site web',
    websiteUrlPlaceholder: 'https://exemple.com/magasins',
    websiteUrlDesc: 'L\'outil analysera automatiquement la page pour extraire les informations des magasins',
    brandName: 'Nom de la marque',
    brandNamePlaceholder: 'Ex: McDonald\'s, Zara, H&M...',
    brandNameDesc: 'Recherche automatique des magasins de cette marque via APIs et bases de données publiques',
    startCollection: 'Démarrer la collecte',
    collectionInProgress: 'Collecte en cours...',
    collectionResults: 'Résultats de collecte',
    collections: 'collections',
    storesCollected: 'Magasins collectés',
    completedCollections: 'Collections terminées',
    inProgress: 'En cours',
    citiesCovered: 'Villes couvertes',
    noCollectionStarted: 'Aucune collecte lancée',
    useOptionsAbove: 'Utilisez les options ci-dessus pour commencer à collecter des magasins.',
    exportStores: 'Exporter les magasins',
    refresh: 'Actualiser',
    stores: 'magasins',
    processed: 'traités',
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Terminé',
    cards: 'Cartes',
    list: 'Liste',
    noStoresCollected: 'Aucun magasin collecté',
    collectionNotStarted: 'La collecte n\'a pas encore commencé ou aucun résultat trouvé.',
    
    ecommercePlatform: 'Plateforme E-commerce',
    platformDetected: 'Plateforme détectée',
    noPlatformDetected: 'Aucune plateforme détectée',
    confidence: 'Confiance',
    indicators: 'Indicateurs',
    version: 'Version',
    platformAnalysis: 'Analyse de plateforme',
    inputMethod: 'Méthode de saisie',
    manualInput: 'Saisie manuelle',
    domainList: 'Liste de domaines',
    salesforceAP: 'Salesforce AP',
    apNumber: 'Numéro d\'AP',
    addDomains: 'Ajouter des domaines',
    domainsPlaceholder: 'Saisissez les domaines (un par ligne)\nexemple.com\nautresite.fr\nboutique.net',
    domainsToCheck: 'Domaines à vérifier',
    salesforceAPNumber: 'Numéro d\'AP Salesforce',
    salesforceAPPlaceholder: 'Ex: AP-003399 ou 3399',
    salesforceAPDesc: 'Les domaines associés à cette AP seront automatiquement récupérés depuis Salesforce',
    startVerification: 'Démarrer la vérification',
    verificationInProgress: 'Vérification en cours...',
    verificationResults: 'Résultats de vérification',
    domains: 'domaines',
    exportCSV: 'Exporter CSV',
    checking: 'En cours...',
    domainCheckStatusError: 'Erreur',
    botBlockers: 'Bot Blockers',
    crawlStatus: 'Statut Crawl',
    clientUsage: 'Utilisation Clients',
    productIdentifiers: 'Identifiants Produits',
    eanResponsive: 'Test EAN Responsive',
    severity: 'Sévérité',
    noBotBlockersDetected: 'Aucun bot blocker détecté',
    crawled: 'Crawlé',
    notCrawled: 'Non crawlé',
    lastCrawl: 'Dernier crawl',
    clients: 'client(s)',
    coverage: 'Couverture',
    searchForm: 'Formulaire',
    found: 'Trouvé',
    notFound: 'Non trouvé',
    testDetails: 'Détails du test',
    retrievingDomains: 'Récupération des domaines depuis Salesforce AP...',
    domainProfile: 'Profil de Domaine',
    profileType: 'Type de Profil',
    brandSite: 'Site de Marque',
    ecommerceSite: 'Site E-commerce',
    marketplace: 'Marketplace',
    unknownProfile: 'Profil Inconnu',
    brandName: 'Nom de Marque',
    marketplaceType: 'Type de Marketplace'
  },
  
  es: {
    // Navigation
    newConversation: 'Nueva conversación',
    settings: 'Configuración',
    switchTheme: 'Cambiar a tema {theme}',
    
    // Chat
    you: 'Tú',
    assistant: 'Asistente IA comercial',
    thinking: 'El asistente está pensando...',
    askQuestion: 'Haz tu pregunta comercial...',
    addFiles: 'Añadir archivos',
    sendInstructions: 'Presiona Enter para enviar, Shift + Enter para nueva línea',
    
    // Welcome
    welcomeTitle: 'Asistente IA Wiser',
    welcomeDescription: 'Tu asistente IA especializado en ventas. Haz tus preguntas comerciales y sube archivos Excel/CSV para obtener análisis personalizados.',
    suggestionsStart: 'Sugerencias para empezar',
    
    // File upload
    addExcelCsv: 'Añadir archivo Excel/CSV',
    onlyExcelCsv: 'Solo se permiten archivos Excel (.xlsx, .xls) y CSV',
    
    // Prompts
    analyzeTender: 'Analizar licitación',
    analyzeTenderDesc: 'Analizar una licitación para identificar oportunidades y riesgos',
    analyzeTenderPrompt: '¿Puedes analizar esta licitación? Subiré el documento para que me ayudes a identificar oportunidades, riesgos y la estrategia de respuesta óptima.',
    productQuestion: '¿Pregunta sobre producto?',
    productQuestionDesc: 'Obtener información detallada sobre tus productos y soluciones',
    productQuestionPrompt: 'Tengo una pregunta sobre uno de nuestros productos/soluciones. ¿Puedes ayudarme a entender sus características, ventajas competitivas y casos de uso?',
    analyzeDomains: 'Analizar lista de dominios',
    analyzeDomainsDesc: 'Analizar una lista de dominios web para identificar prospectos',
    analyzeDomainsPrompt: '¿Puedes analizar esta lista de dominios web? Subiré el archivo para que me ayudes a identificar empresas prospecto, su sector de actividad y potencial comercial.',
    riCoverage: 'Conocer tasa cobertura RI',
    riCoverageDesc: 'Calcular y analizar tu tasa de cobertura de red de influencia',
    riCoveragePrompt: 'Ayúdame a calcular y analizar mi tasa de cobertura de red de influencia (RI). Compartiré mis datos para evaluar nuestra presencia territorial.',
    
    // Domain crawling analysis
    analyzeDomainsCrawling: 'Analizar dominios',
    analyzeDomainsCrawlingDesc: 'Analizar dominios para estimar nuestra capacidad de crawling/matching',
    analyzeDomainsCrawlingPrompt: 'Necesito analizar la siguiente lista de sitios/dominios. Debes indicarme si hay protecciones anti-bot en su lugar y si es así, cuáles. También debes estimar la facilidad de crawling/matching basándote en criterios técnicos que conoces.',
    
    // Errors
    errorOccurred: 'Ocurrió un error',
    communicationError: 'No se puede comunicar con el agente IA. Por favor, inténtalo de nuevo.',
    
    // Categories
    analysis: 'Análisis',
    strategy: 'Estrategia',
    prospecting: 'Prospección',
    reporting: 'Reportes',
    
    // Authentication
    login: 'Iniciar sesión',
    email: 'Dirección de email',
    password: 'Contraseña',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loginInProgress: 'Iniciando sesión...',
    loginError: 'Error de inicio de sesión',
    noAccount: '¿Aún no tienes cuenta?',
    contactAdmin: 'Contacta a tu administrador',
    termsAndConditions: 'términos de uso',
    privacyPolicy: 'política de privacidad',
    byLoggingIn: 'Al iniciar sesión, aceptas nuestros',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    
    // App Layout
    chat: 'Chat',
    administration: 'Administración',
    search: 'Buscar...',
    notifications: 'Notificaciones',
    myProfile: 'Mi perfil',
    logout: 'Cerrar sesión',
    
    // Admin Dashboard
    dashboard: 'Panel de control',
    platformOverview: 'Vista general de tu plataforma',
    export: 'Exportar',
    newReport: 'Nuevo reporte',
    totalUsers: 'Usuarios totales',
    activeUsers: 'Usuarios activos',
    availableRoles: 'Roles disponibles',
    administrators: 'Administradores',
    vsLastMonth: 'vs mes pasado',
    recentActivity: 'Actividad reciente',
    alerts: 'Alertas',
    quickActions: 'Acciones rápidas',
    newUsersThisWeek: 'nuevos usuarios esta semana',
    connectionsToday: 'conexiones hoy',
    rolesUpdated: 'roles actualizados',
    inactiveAccounts30Days: 'cuentas inactivas por 30 días',
    expiredSession: 'sesión expirada',
    createUser: 'Crear usuario',
    exportData: 'Exportar datos',
    managePermissions: 'Gestionar permisos',
    
    // User Management
    userManagement: 'Gestión de usuarios',
    usersTotal: 'usuarios en total',
    manageRoles: 'Gestionar roles',
    newUser: 'Nuevo usuario',
    searchByName: 'Buscar por nombre, email...',
    allRoles: 'Todos los roles',
    user: 'Usuario',
    role: 'Rol',
    status: 'Estado',
    connectionCount: 'Conexiones',
    lastLogin: 'Último acceso',
    createdOn: 'Creado el',
    actions: 'Acciones',
    active: 'Activo',
    inactive: 'Inactivo',
    never: 'Nunca',
    activeUser: 'Activo',
    regularUser: 'Regular',
    newUser: 'Nuevo',
    edit: 'Editar',
    activate: 'Activar',
    deactivate: 'Desactivar',
    noUsersFound: 'No se encontraron usuarios',
    tryModifyingSearch: 'Intenta modificar tus criterios de búsqueda.',
    deleteUser: 'Eliminar usuario',
    confirmDeletion: 'Confirmar eliminación',
    deleteUserConfirmation: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
    warning: 'Advertencia',
    deleteUserWarning: 'This action is irreversible. All data associated with this user will be permanently deleted.',
    deleteDefinitively: 'Eliminar permanentemente',
    
    // User Modal
    editUser: 'Editar usuario',
    username: 'Nombre de usuario',
    fullName: 'Nombre completo',
    selectRole: 'Seleccionar un rol',
    cancel: 'Cancelar',
    update: 'Actualizar',
    create: 'Crear',
    error: 'Error',
    
    // Role Modal
    roleManagement: 'Gestión de roles',
    availableRoles2: 'Roles disponibles',
    description: 'Descripción',
    permissions: 'Permisos',
    information: 'Información',
    permissionsInfo: 'Los permisos se definen a nivel de base de datos y solo pueden ser modificados por un administrador del sistema.',
    selectRoleToView: 'Selecciona un rol para ver sus detalles',
    close: 'Cerrar',
    
    // Welcome messages
    welcomeToWiser: 'Bienvenido a The SE toolbox',
    specializedRetailAI: 'Tu caja de herramientas completa para Sales Engineers con asistente IA y herramientas de análisis',
    
    // Copy functionality
    copyResponse: 'Copiar respuesta',
    copied: 'Copiado',
    
    // Domain Checker
    domainChecker: 'Domain Checker',
    
    // Store Collector additional
    collectionMethod: 'Método de recopilación',
    retailersCountryCodes: 'Retailers + códigos de país',
    automaticScraping: 'Scraping automático',
    automaticSearch: 'Búsqueda automática',
    expectedFormat: 'Formato esperado',
    retailerFormat: 'Nombre del retailer, Código de país[, dominio.com]',
    formatInstructions: '• Separadores: coma (,) o punto y coma (;)<br/>• Un retailer por línea<br/>• El dominio es opcional',
    loadExample: 'Cargar ejemplo con 10 retailers',
    storesProcessed: 'tiendas procesadas',
    name: 'Nombre',
    address: 'Dirección',
    contact: 'Contacto',
    brand: 'Marca',
    website: 'Sitio web',
    processed: 'Procesado',
    
    // Test Selector
    testsToExecute: 'Tests a ejecutar',
    testsSelected: 'test(s) seleccionado(s)',
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    noTestSelected: 'Ningún test seleccionado',
    selectAtLeastOneTest: 'Selecciona al menos un test para ejecutar el análisis.',
    pleaseSelectAtLeastOneTest: 'Por favor selecciona al menos un test para ejecutar',
    
    // Team Performance
    teamPerformanceDashboard: 'Panel de Rendimiento del Equipo',
    teamPerformanceDesc: 'Seguimiento del rendimiento del equipo de Sales Engineering',
    activeMembers: 'Miembros activos',
    totalStudies: 'Estudios totales',
    domainCheckerDesc: 'Analiza dominios y verifica su compatibilidad con nuestros sistemas',
    
    // Store Collector
    storeCollector: 'Store List Collector',
    storeCollectorDesc: 'Recopila y analiza listas de tiendas para tus prospectos',
    collectStores: 'Recopilar tiendas',
    generateMockData: 'Generar datos ficticios',
    mapView: 'Vista de mapa',
    storeLocations: 'Ubicaciones de tiendas',
    centerMap: 'Centrar mapa',
    fullscreen: 'Pantalla completa',
    noLocationsToDisplay: 'No hay ubicaciones para mostrar',
    storesNeedCoordinates: 'Las tiendas necesitan coordenadas para mostrarse en el mapa',
    clickMarkersForDetails: 'Haz clic en los marcadores para ver detalles',
    poweredByOpenStreetMap: 'Desarrollado por OpenStreetMap',
    manualInput: 'Entrada manual',
    websiteScraping: 'Scraping web',
    brandSearch: 'Búsqueda por marca',
    addRetailers: 'Añadir retailers',
    retailersPlaceholder: 'Ingresa retailers (uno por línea)\nCarrefour, FR, carrefour.fr\nAuchan, FR\nTesco; GB; tesco.com\nWalmart, US, walmart.com',
    retailersToCollect: 'Retailers a recopilar',
    websiteUrl: 'URL del sitio web',
    websiteUrlPlaceholder: 'https://ejemplo.com/tiendas',
    websiteUrlDesc: 'La herramienta analizará automáticamente la página para extraer información de las tiendas',
    brandName: 'Nombre de la marca',
    brandNamePlaceholder: 'Ej: McDonald\'s, Zara, H&M...',
    brandNameDesc: 'Búsqueda automática de tiendas de esta marca a través de APIs y bases de datos públicas',
    startCollection: 'Iniciar recopilación',
    collectionInProgress: 'Recopilación en progreso...',
    collectionResults: 'Resultados de recopilación',
    collections: 'recopilaciones',
    storesCollected: 'Tiendas recopiladas',
    completedCollections: 'Recopilaciones completadas',
    inProgress: 'En progreso',
    citiesCovered: 'Ciudades cubiertas',
    noCollectionStarted: 'Ninguna recopilación iniciada',
    useOptionsAbove: 'Usa las opciones de arriba para comenzar a recopilar tiendas.',
    exportStores: 'Exportar tiendas',
    refresh: 'Actualizar',
    stores: 'tiendas',
    processed: 'procesadas',
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    statusError: 'Error',
    list: 'Lista',
    noStoresCollected: 'Ninguna tienda recopilada',
    collectionNotStarted: 'La recopilación aún no ha comenzado o no se encontraron resultados.',
    
    ecommercePlatform: 'Plataforma E-commerce',
    platformDetected: 'Plataforma detectada',
    noPlatformDetected: 'Ninguna plataforma detectada',
    confidence: 'Confianza',
    indicators: 'Indicadores',
    version: 'Versión',
    platformAnalysis: 'Análisis de plataforma',
    inputMethod: 'Método de entrada',
    manualInput: 'Entrada manual',
    domainList: 'Lista de dominios',
    salesforceAP: 'Salesforce AP',
    apNumber: 'Número de AP',
    addDomains: 'Añadir dominios',
    domainsPlaceholder: 'Ingresa dominios (uno por línea)\nejemplo.com\notrositio.es\ntienda.net',
    domainsToCheck: 'Dominios a verificar',
    salesforceAPNumber: 'Número de AP Salesforce',
    salesforceAPPlaceholder: 'Ej: AP-003399 o 3399',
    salesforceAPDesc: 'Los dominios asociados con esta AP serán recuperados automáticamente desde Salesforce',
    startVerification: 'Iniciar verificación',
    verificationInProgress: 'Verificación en progreso...',
    verificationResults: 'Resultados de verificación',
    exportCSV: 'Exportar CSV',
    checking: 'Verificando...',
    botBlockers: 'Bot Blockers',
    crawlStatus: 'Estado Crawl',
    clientUsage: 'Uso de Clientes',
    productIdentifiers: 'Identificadores de Productos',
    eanResponsive: 'Test EAN Responsive',
    severity: 'Severidad',
    noBotBlockersDetected: 'No se detectaron bot blockers',
    crawled: 'Crawleado',
    notCrawled: 'No crawleado',
    lastCrawl: 'Último crawl',
    clients: 'cliente(s)',
    coverage: 'Cobertura',
    searchForm: 'Formulario',
    found: 'Encontrado',
    notFound: 'No encontrado',
    testDetails: 'Detalles del test',
    retrievingDomains: 'Recuperando dominios desde Salesforce AP...',
    domainProfile: 'Perfil de Dominio',
    profileType: 'Tipo de Perfil',
    brandSite: 'Sitio de Marca',
    ecommerceSite: 'Sitio E-commerce',
    marketplace: 'Marketplace',
    unknownProfile: 'Perfil Desconocido',
    brandName: 'Nombre de Marca',
    marketplaceType: 'Tipo de Marketplace'
  }
};

export const getLanguageOptions = (): Array<{ code: Language; name: string; flag: string }> => [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const getTranslation = (language: Language, key: keyof Translations, params?: Record<string, string>): string => {
  let translation = translations[language][key] || translations['en'][key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value);
    });
  }
  
  return translation;
};