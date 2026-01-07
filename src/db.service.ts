/**
 * Database Service - D1 Wrapper
 * Professional migration from inMemoryDB to D1
 */

// Helper pour générer des IDs D1-style
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export class DatabaseService {
  private db: D1Database
  
  constructor(db: D1Database) {
    this.db = db
  }

  // ==========================================
  // USERS
  // ==========================================
  
  async getUserByEmail(email: string) {
    return await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()
  }
  
  async getUserById(id: string) {
    return await this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first()
  }
  
  async getUserByGoogleId(googleId: string) {
    return await this.db.prepare(
      'SELECT * FROM users WHERE google_id = ?'
    ).bind(googleId).first()
  }
  
  async getUserByFacebookId(facebookId: string) {
    return await this.db.prepare(
      'SELECT * FROM users WHERE facebook_id = ?'
    ).bind(facebookId).first()
  }
  
  async createUser(user: any) {
    const id = user.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO users (
        id, email, name, phone, password_hash, 
        avatar_url, kyc_status, google_id, facebook_id,
        rating, reviews_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      user.email,
      user.name,
      user.phone || '',
      user.password_hash || '',
      user.avatar_url || '',
      user.kyc_status || 'PENDING',
      user.google_id || null,
      user.facebook_id || null,
      user.rating || 0,
      user.reviews_count || 0,
      user.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...user,
      id
    }
  }
  
  async updateUser(id: string, updates: any) {
    const fields = []
    const values = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    
    if (fields.length === 0) return await this.getUserById(id)
    
    await this.db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run()
    
    return await this.getUserById(id)
  }
  
  async updateUserByEmail(email: string, updates: any) {
    const fields = []
    const values = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    
    if (fields.length === 0) return await this.getUserByEmail(email)
    
    await this.db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE email = ?
    `).bind(...values, email).run()
    
    return await this.getUserByEmail(email)
  }
  
  async getAllUsers() {
    const result = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    return result.results || []
  }

  // ==========================================
  // TRIPS
  // ==========================================
  
  async getTripById(id: string) {
    return await this.db.prepare(
      'SELECT * FROM trips WHERE id = ?'
    ).bind(id).first()
  }
  
  async getTripsByUserId(userId: string) {
    const result = await this.db.prepare(
      'SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    return result.results || []
  }
  
  async createTrip(trip: any) {
    const id = trip.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO trips (
        id, user_id, departure_city, departure_country,
        arrival_city, arrival_country, departure_date,
        available_weight, price_per_kg, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      trip.user_id,
      trip.departure_city,
      trip.departure_country || 'France',
      trip.arrival_city,
      trip.arrival_country || 'Maroc',
      trip.departure_date,
      trip.available_weight,
      trip.price_per_kg,
      trip.status || 'ACTIVE',
      trip.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...trip,
      id
    }
  }
  
  async updateTrip(id: string, updates: any) {
    const fields = []
    const values = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    
    if (fields.length === 0) return await this.getTripById(id)
    
    await this.db.prepare(`
      UPDATE trips 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run()
    
    return await this.getTripById(id)
  }
  
  async getAllTrips() {
    const result = await this.db.prepare(
      'SELECT * FROM trips WHERE status = ? ORDER BY departure_date ASC'
    ).bind('ACTIVE').all()
    return result.results || []
  }
  
  async searchTrips(departure: string, arrival: string) {
    const result = await this.db.prepare(`
      SELECT * FROM trips 
      WHERE departure_city LIKE ? 
      AND arrival_city LIKE ? 
      AND status = 'ACTIVE'
      ORDER BY departure_date ASC
    `).bind(`%${departure}%`, `%${arrival}%`).all()
    return result.results || []
  }

  // ==========================================
  // PACKAGES
  // ==========================================
  
  async getPackageById(id: string) {
    return await this.db.prepare(
      'SELECT * FROM packages WHERE id = ?'
    ).bind(id).first()
  }
  
  async getPackagesByUserId(userId: string) {
    const result = await this.db.prepare(
      'SELECT * FROM packages WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    return result.results || []
  }
  
  async createPackage(pkg: any) {
    const id = pkg.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO packages (
        id, user_id, title, description, content_declaration,
        weight, length, width, height, budget,
        departure_city, arrival_city, preferred_date,
        photos, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      pkg.user_id,
      pkg.title || 'Colis',
      pkg.description || '',
      pkg.content_declaration || '',
      pkg.weight,
      pkg.length || null,
      pkg.width || null,
      pkg.height || null,
      pkg.budget || pkg.max_price || 0,
      pkg.departure_city,
      pkg.arrival_city || pkg.destination_city,
      pkg.preferred_date || null,
      pkg.photos || '[]',
      pkg.status || 'PUBLISHED',
      pkg.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...pkg,
      id
    }
  }
  
  async updatePackage(id: string, updates: any) {
    const fields = []
    const values = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    
    if (fields.length === 0) return await this.getPackageById(id)
    
    await this.db.prepare(`
      UPDATE packages 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run()
    
    return await this.getPackageById(id)
  }
  
  async getAllPackages() {
    const result = await this.db.prepare(
      'SELECT * FROM packages WHERE status = ? ORDER BY created_at DESC'
    ).bind('PUBLISHED').all()
    return result.results || []
  }
  
  async searchPackages(departure: string, arrival: string) {
    const result = await this.db.prepare(`
      SELECT * FROM packages 
      WHERE departure_city LIKE ? 
      AND arrival_city LIKE ? 
      AND status = 'PUBLISHED'
      ORDER BY created_at DESC
    `).bind(`%${departure}%`, `%${arrival}%`).all()
    return result.results || []
  }

  // ==========================================
  // TRANSACTIONS (ex-bookings)
  // ==========================================
  
  async getTransactionById(id: string) {
    return await this.db.prepare(
      'SELECT * FROM transactions WHERE id = ?'
    ).bind(id).first()
  }
  
  async getTransactionsByUserId(userId: string) {
    const result = await this.db.prepare(`
      SELECT * FROM transactions 
      WHERE shipper_id = ? OR traveler_id = ?
      ORDER BY created_at DESC
    `).bind(userId, userId).all()
    return result.results || []
  }
  
  async createTransaction(transaction: any) {
    const id = transaction.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO transactions (
        id, package_id, trip_id, shipper_id, traveler_id,
        agreed_price, platform_fee, traveler_payout,
        stripe_payment_intent_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      transaction.package_id,
      transaction.trip_id,
      transaction.shipper_id || transaction.sender_id,
      transaction.traveler_id,
      transaction.agreed_price || transaction.total_price,
      transaction.platform_fee || 0.12,
      transaction.traveler_payout || 0,
      transaction.stripe_payment_intent_id || null,
      transaction.status || 'PENDING',
      transaction.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...transaction,
      id
    }
  }
  
  async updateTransaction(id: string, updates: any) {
    const fields = []
    const values = []
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
    
    if (fields.length === 0) return await this.getTransactionById(id)
    
    await this.db.prepare(`
      UPDATE transactions 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(...values, id).run()
    
    return await this.getTransactionById(id)
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  
  async getReviewsByUserId(userId: string) {
    const result = await this.db.prepare(
      'SELECT * FROM reviews WHERE reviewed_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    return result.results || []
  }
  
  async createReview(review: any) {
    const id = review.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO reviews (
        id, transaction_id, reviewer_id, reviewed_id,
        rating, punctuality_rating, communication_rating, care_rating,
        comment, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      review.transaction_id,
      review.reviewer_id,
      review.reviewed_id,
      review.rating,
      review.punctuality_rating || review.rating,
      review.communication_rating || review.rating,
      review.care_rating || review.rating,
      review.comment || '',
      review.created_at || new Date().toISOString()
    ).run()
    
    // Update user rating
    const reviews = await this.getReviewsByUserId(review.reviewed_id)
    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    
    await this.updateUser(review.reviewed_id, {
      rating: avgRating,
      reviews_count: reviews.length
    })
    
    return {
      ...review,
      id
    }
  }

  // ==========================================
  // MESSAGES
  // ==========================================
  
  async getMessagesByTransactionId(transactionId: string) {
    const result = await this.db.prepare(
      'SELECT * FROM messages WHERE transaction_id = ? ORDER BY created_at ASC'
    ).bind(transactionId).all()
    return result.results || []
  }
  
  async getConversationsBetween(userId1: string, userId2: string) {
    const result = await this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
      OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).bind(userId1, userId2, userId2, userId1).all()
    return result.results || []
  }
  
  async createMessage(message: any) {
    const id = message.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO messages (
        id, transaction_id, sender_id, receiver_id,
        content, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      message.transaction_id,
      message.sender_id,
      message.receiver_id,
      message.content,
      message.is_read || 0,
      message.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...message,
      id
    }
  }
  
  async markMessageAsRead(messageId: string) {
    await this.db.prepare(
      'UPDATE messages SET is_read = 1 WHERE id = ?'
    ).bind(messageId).run()
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  
  async getNotificationsByUserId(userId: string) {
    const result = await this.db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(userId).all()
    return result.results || []
  }
  
  async createNotification(notification: any) {
    const id = notification.id || generateId()
    
    await this.db.prepare(`
      INSERT INTO notifications (
        id, user_id, type, title, message, link, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      notification.user_id,
      notification.type,
      notification.title,
      notification.message,
      notification.link || null,
      notification.is_read || 0,
      notification.created_at || new Date().toISOString()
    ).run()
    
    return {
      ...notification,
      id
    }
  }
  
  async markNotificationAsRead(notificationId: string) {
    await this.db.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ?'
    ).bind(notificationId).run()
  }
}
