/**
 * Schéma MySQL / MariaDB (Hostinger) de la Fondation MIRADEL FEVEPA.
 * Montants : entiers. CDF = francs congolais, USD = cents.
 * Identifiants : UUID texte générés côté serveur.
 * Toute modification passe par `npm run db:generate` (une migration = un fichier SQL).
 */
import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  customType,
  datetime,
  index,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

// JSON stocké en texte : fonctionne sur MySQL comme sur MariaDB (où JSON = LONGTEXT).
const jsonText = <T>(name: string) =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'longtext',
    toDriver: (value) => JSON.stringify(value),
    fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value) as T,
  })(name)

const id = () =>
  varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

const timestamps = {
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdateFn(() => new Date()),
}

export const CURRENCIES = ['CDF', 'USD'] as const

const currency = () =>
  varchar('currency', { length: 3, enum: CURRENCIES })
    .notNull()
    .default('CDF')

/** Lien facultatif vers un programme (produit fabriqué, actualité, chiffre, témoignage…). */
const programRef = () =>
  varchar('program_id', { length: 36 }).references(() => programs.id, { onDelete: 'set null' })

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------

export const users = mysqlTable(
  'users',
  {
    id: id(),
    email: varchar('email', { length: 191 }).notNull(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    passwordHash: varchar('password_hash', { length: 100 }).notNull(),
    role: varchar('role', { length: 20, enum: ['owner', 'editor', 'lean_admin'] })
      .notNull()
      .default('editor'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: datetime('last_login_at', { mode: 'date' }),
    ...timestamps,
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)],
)

export const sessions = mysqlTable(
  'sessions',
  {
    // Empreinte SHA-256 du jeton : le jeton lui-même n'est jamais stocké.
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
    ...timestamps,
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

export const passwordResets = mysqlTable('password_resets', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
  ...timestamps,
})

export const auditLog = mysqlTable(
  'audit_log',
  {
    id: id(),
    tableName: varchar('table_name', { length: 64 }).notNull(),
    recordId: varchar('record_id', { length: 36 }),
    action: varchar('action', { length: 10, enum: ['INSERT', 'UPDATE', 'DELETE'] }).notNull(),
    userId: varchar('user_id', { length: 36 }),
    oldValues: jsonText<Record<string, unknown> | null>('old_values'),
    newValues: jsonText<Record<string, unknown> | null>('new_values'),
    ...timestamps,
  },
  (t) => [index('audit_log_record_idx').on(t.tableName, t.recordId)],
)

// ---------------------------------------------------------------------------
// Paramètres (ligne unique, id = 1)
// ---------------------------------------------------------------------------

export type SocialLinks = {
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  youtube?: string | null
  linkedin?: string | null
  x?: string | null
}
export type PaymentNumber = {
  /** Ex. « M-Pesa », « Orange Money », « Airtel Money » */
  provider: string
  number: string
  /** Nom du titulaire affiché au donateur ou à l'acheteur */
  holder: string
}
export type SuggestedAmount = { amount: number; currency: (typeof CURRENCIES)[number] }

export const settings = mysqlTable('settings', {
  id: int('id').primaryKey().default(1),
  organizationName: varchar('organization_name', { length: 160 }).notNull(),
  acronym: varchar('acronym', { length: 40 }),
  tagline: varchar('tagline', { length: 255 }),
  legalStatus: varchar('legal_status', { length: 160 }),
  registrationNumber: varchar('registration_number', { length: 120 }),
  address: varchar('address', { length: 255 }),
  googleMapsUrl: varchar('google_maps_url', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull(),
  emails: jsonText<string[]>('emails').notNull(),
  socialLinks: jsonText<SocialLinks>('social_links').notNull(),
  // Coordonnées de paiement (boutique et dons), saisies par la fondation.
  paymentNumbers: jsonText<PaymentNumber[]>('payment_numbers').notNull(),
  bankDetails: text('bank_details'),
  donationAmounts: jsonText<SuggestedAmount[]>('donation_amounts').notNull(),
  defaultCurrency: currency(),
  // Taux indicatif saisi à la main, jamais récupéré automatiquement.
  usdToCdfRate: int('usd_to_cdf_rate'),
  ...timestamps,
})

// ---------------------------------------------------------------------------
// Médias (images envoyées depuis l'admin, stockées sur le disque du serveur)
// ---------------------------------------------------------------------------

export const media = mysqlTable('media', {
  id: id(),
  // Chemin relatif dans UPLOAD_DIR, ex. « 2026/10/<uuid>.webp »
  path: varchar('path', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  width: int('width'),
  height: int('height'),
  sizeBytes: int('size_bytes').notNull(),
  alt: varchar('alt', { length: 255 }),
  ...timestamps,
})

// ---------------------------------------------------------------------------
// Institutionnel
// ---------------------------------------------------------------------------

export const PROGRAM_STATUSES = ['en_cours', 'termine', 'en_preparation'] as const

export const programs = mysqlTable(
  'programs',
  {
    id: id(),
    title: varchar('title', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    summary: varchar('summary', { length: 400 }),
    content: text('content'),
    coverImageUrl: varchar('cover_image_url', { length: 500 }),
    gallery: jsonText<string[]>('gallery').notNull(),
    // Droit à l'image : la galerie ne s'affiche qu'avec l'autorisation des personnes photographiées.
    galleryConsent: boolean('gallery_consent').notNull().default(false),
    areas: varchar('areas', { length: 400 }),
    beneficiaries: varchar('beneficiaries', { length: 400 }),
    status: varchar('status', { length: 16, enum: PROGRAM_STATUSES }).notNull().default('en_cours'),
    position: int('position').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex('programs_slug_unique').on(t.slug)],
)

export const impactMetrics = mysqlTable('impact_metrics', {
  id: id(),
  label: varchar('label', { length: 160 }).notNull(),
  value: int('value').notNull(),
  unit: varchar('unit', { length: 40 }),
  period: varchar('period', { length: 80 }),
  // Justification interne obligatoire (rapport, liste de présence…), jamais affichée.
  source: text('source').notNull(),
  programId: programRef(),
  position: int('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
})

export const posts = mysqlTable(
  'posts',
  {
    id: id(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 220 }).notNull(),
    excerpt: varchar('excerpt', { length: 300 }),
    content: text('content'),
    imageUrl: varchar('image_url', { length: 500 }),
    programId: programRef(),
    publishedAt: datetime('published_at', { mode: 'date' }),
    seoTitle: varchar('seo_title', { length: 200 }),
    seoDescription: varchar('seo_description', { length: 300 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('posts_slug_unique').on(t.slug)],
)

export const DOCUMENT_TYPES = [
  'statuts',
  'agrement',
  'rapport_activite',
  'rapport_financier',
  'autre',
] as const

export const documents = mysqlTable('documents', {
  id: id(),
  title: varchar('title', { length: 200 }).notNull(),
  type: varchar('type', { length: 20, enum: DOCUMENT_TYPES }).notNull(),
  year: int('year'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileSizeBytes: int('file_size_bytes').notNull(),
  description: varchar('description', { length: 400 }),
  position: int('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
})

export const teamMembers = mysqlTable('team_members', {
  id: id(),
  fullName: varchar('full_name', { length: 120 }).notNull(),
  role: varchar('role', { length: 120 }).notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  bio: text('bio'),
  position: int('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
})

export const partners = mysqlTable('partners', {
  id: id(),
  name: varchar('name', { length: 160 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  websiteUrl: varchar('website_url', { length: 500 }),
  position: int('position').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
})

export const testimonials = mysqlTable(
  'testimonials',
  {
    id: id(),
    displayName: varchar('display_name', { length: 80 }).notNull(),
    body: text('body').notNull(),
    programId: programRef(),
    consentObtained: boolean('consent_obtained').notNull().default(false),
    isPublished: boolean('is_published').notNull().default(false),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  () => [
    // Un témoignage ne peut être publié qu'avec l'accord de la personne.
    check('testimonials_consent', sql.raw('`is_published` = 0 OR `consent_obtained` = 1')),
  ],
)

// ---------------------------------------------------------------------------
// Boutique solidaire
// ---------------------------------------------------------------------------

export const productCategories = mysqlTable(
  'product_categories',
  {
    id: id(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: varchar('description', { length: 400 }),
    imageUrl: varchar('image_url', { length: 500 }),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex('product_categories_slug_unique').on(t.slug)],
)

/** Ex. { contenance: ['1 L', '2,5 L'] } */
export type ProductVariants = Record<string, string[]>

export const products = mysqlTable(
  'products',
  {
    id: id(),
    categoryId: varchar('category_id', { length: 36 }).references(() => productCategories.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: text('description'),
    // Contenance / conditionnement (« Bidon de 1 L »).
    packaging: varchar('packaging', { length: 120 }),
    composition: text('composition'),
    usageTips: text('usage_tips'),
    // null = prix à confirmer : le produit est visible mais se commande sur WhatsApp.
    priceAmount: int('price_amount'),
    currency: currency(),
    compareAtAmount: int('compare_at_amount'),
    // null = stock non suivi
    stock: int('stock'),
    variants: jsonText<ProductVariants>('variants').notNull(),
    images: jsonText<string[]>('images').notNull(),
    programId: programRef(),
    isPublished: boolean('is_published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    position: int('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('products_slug_unique').on(t.slug),
    check('products_price_positive', sql.raw('`price_amount` IS NULL OR `price_amount` >= 0')),
  ],
)

export const promotions = mysqlTable('promotions', {
  id: id(),
  title: varchar('title', { length: 120 }).notNull(),
  subtitle: varchar('subtitle', { length: 200 }),
  description: text('description'),
  badge: varchar('badge', { length: 40 }),
  bannerUrl: varchar('banner_url', { length: 500 }),
  discountType: varchar('discount_type', {
    length: 20,
    enum: ['percentage', 'fixed_amount', 'display_only'],
  }).notNull(),
  discountValue: int('discount_value').notNull().default(0),
  scope: varchar('scope', {
    length: 20,
    enum: ['all_products', 'product_category', 'items'],
  }).notNull(),
  startsAt: datetime('starts_at', { mode: 'date' }),
  endsAt: datetime('ends_at', { mode: 'date' }),
  // Jours ISO : 1 = lundi … 7 = dimanche. null = tous les jours.
  weekdays: jsonText<number[] | null>('weekdays'),
  // Réduction par quantité : s'applique à partir de N unités d'un même produit.
  minQuantity: int('min_quantity'),
  ctaLabel: varchar('cta_label', { length: 40 }),
  ctaHref: varchar('cta_href', { length: 255 }),
  isActive: boolean('is_active').notNull().default(false),
  showBanner: boolean('show_banner').notNull().default(false),
  priority: int('priority').notNull().default(0),
  position: int('position').notNull().default(0),
  ...timestamps,
})

export const promotionTargets = mysqlTable(
  'promotion_targets',
  {
    id: id(),
    promotionId: varchar('promotion_id', { length: 36 })
      .notNull()
      .references(() => promotions.id, { onDelete: 'cascade' }),
    targetType: varchar('target_type', {
      length: 20,
      enum: ['product', 'product_category'],
    }).notNull(),
    targetId: varchar('target_id', { length: 36 }).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('promotion_targets_unique').on(t.promotionId, t.targetType, t.targetId)],
)

export const ORDER_STATUSES = ['nouvelle', 'confirmée', 'payée', 'livrée', 'annulée'] as const
export const PAYMENT_METHODS = ['mobile_money', 'cash_livraison', 'virement', 'sur_place'] as const
export const DELIVERY_MODES = ['livraison', 'retrait'] as const

export const orders = mysqlTable(
  'orders',
  {
    id: id(),
    // Référence courte lisible, reprise dans le message WhatsApp (ex. C-9XMP2).
    reference: varchar('reference', { length: 12 }).notNull(),
    customerName: varchar('customer_name', { length: 120 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 16 }).notNull(),
    deliveryMode: varchar('delivery_mode', { length: 10, enum: DELIVERY_MODES })
      .notNull()
      .default('livraison'),
    deliveryCommune: varchar('delivery_commune', { length: 80 }),
    deliveryAddress: varchar('delivery_address', { length: 255 }),
    totalAmount: int('total_amount').notNull(),
    currency: currency(),
    paymentMethod: varchar('payment_method', { length: 16, enum: PAYMENT_METHODS }).notNull(),
    paymentReference: varchar('payment_reference', { length: 80 }),
    status: varchar('status', { length: 12, enum: ORDER_STATUSES }).notNull().default('nouvelle'),
    message: text('message'),
    internalNote: text('internal_note'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('orders_reference_unique').on(t.reference),
    index('orders_status_idx').on(t.status),
  ],
)

export const orderItems = mysqlTable(
  'order_items',
  {
    id: id(),
    orderId: varchar('order_id', { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 36 }).references(() => products.id, {
      onDelete: 'set null',
    }),
    // Valeurs figées au moment de la commande.
    productName: varchar('product_name', { length: 120 }).notNull(),
    variant: jsonText<Record<string, string>>('variant').notNull(),
    quantity: int('quantity').notNull(),
    unitPriceAmount: int('unit_price_amount').notNull(),
    discountAmount: int('discount_amount').notNull().default(0),
    promotionId: varchar('promotion_id', { length: 36 }),
    currency: currency(),
    ...timestamps,
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
)

// ---------------------------------------------------------------------------
// Engagement : dons, messages, newsletter
// ---------------------------------------------------------------------------

export const DONATION_STATUSES = ['déclaré', 'confirmé', 'rejeté'] as const
export const DONATION_METHODS = ['mobile_money', 'virement', 'especes'] as const

/** Déclaration de don : la fondation confirme elle-même la réception des fonds. */
export const donations = mysqlTable(
  'donations',
  {
    id: id(),
    reference: varchar('reference', { length: 12 }).notNull(),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    donorName: varchar('donor_name', { length: 120 }),
    donorPhone: varchar('donor_phone', { length: 16 }).notNull(),
    donorEmail: varchar('donor_email', { length: 191 }),
    amount: int('amount').notNull(),
    currency: currency(),
    paymentMethod: varchar('payment_method', { length: 16, enum: DONATION_METHODS }).notNull(),
    transactionReference: varchar('transaction_reference', { length: 80 }),
    programId: programRef(),
    message: text('message'),
    status: varchar('status', { length: 10, enum: DONATION_STATUSES }).notNull().default('déclaré'),
    internalNote: text('internal_note'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('donations_reference_unique').on(t.reference),
    index('donations_status_idx').on(t.status),
    check('donations_amount_positive', sql.raw('`amount` > 0')),
  ],
)

export const MESSAGE_KINDS = ['contact', 'benevolat', 'partenariat'] as const
export const MESSAGE_STATUSES = ['nouveau', 'en_cours', 'traité'] as const

export const contactMessages = mysqlTable(
  'contact_messages',
  {
    id: id(),
    kind: varchar('kind', { length: 12, enum: MESSAGE_KINDS }).notNull(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 16 }),
    email: varchar('email', { length: 191 }),
    organization: varchar('organization', { length: 160 }),
    message: text('message').notNull(),
    status: varchar('status', { length: 10, enum: MESSAGE_STATUSES }).notNull().default('nouveau'),
    internalNote: text('internal_note'),
    ...timestamps,
  },
  (t) => [index('contact_messages_status_idx').on(t.status)],
)

export const newsletterSubscribers = mysqlTable(
  'newsletter_subscribers',
  {
    id: id(),
    email: varchar('email', { length: 191 }).notNull(),
    consent: boolean('consent').notNull().default(false),
    unsubscribedAt: datetime('unsubscribed_at', { mode: 'date' }),
    ...timestamps,
  },
  (t) => [uniqueIndex('newsletter_subscribers_email_unique').on(t.email)],
)

// ---------------------------------------------------------------------------
// Textes et images des sections fixes du site
// ---------------------------------------------------------------------------

export const pageSections = mysqlTable(
  'page_sections',
  {
    id: id(),
    key: varchar('key', { length: 60 }).notNull(),
    title: varchar('title', { length: 200 }),
    subtitle: varchar('subtitle', { length: 300 }),
    body: text('body'),
    imageUrl: varchar('image_url', { length: 500 }),
    secondaryImageUrl: varchar('secondary_image_url', { length: 500 }),
    buttonLabel: varchar('button_label', { length: 60 }),
    buttonHref: varchar('button_href', { length: 255 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('page_sections_key_unique').on(t.key)],
)
