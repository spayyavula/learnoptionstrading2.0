interface ConstantContactContact {
  email_address: {
    address: string
    permission_to_send: string
  }
  first_name?: string
  last_name?: string
  list_memberships: string[]
}

interface ConstantContactResponse {
  contact_id: string
  email_address: {
    address: string
    permission_to_send: string
  }
  created_at: string
}

export class ConstantContactService {
  private static readonly API_BASE_URL = 'https://api.cc.email/v3'
  
  // Lazy load environment variables
  private static getEnvVars() {
    return {
      API_KEY: import.meta.env.VITE_CONSTANT_CONTACT_API_KEY,
      ACCESS_TOKEN: import.meta.env.VITE_CONSTANT_CONTACT_ACCESS_TOKEN,
      LIST_ID: import.meta.env.VITE_CONSTANT_CONTACT_LIST_ID
    }
  }

  /**
   * Subscribe an email to the Constant Contact list
   */
  static async subscribeEmail(
    email: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<{ success: boolean; message: string; contactId?: string }> {
    try {
      const { API_KEY, ACCESS_TOKEN, LIST_ID } = this.getEnvVars()
      
      // Validate environment variables
      if (!API_KEY || !ACCESS_TOKEN || !LIST_ID) {
        console.warn('Constant Contact not configured, using mock subscription')
        return this.mockSubscription(email)
      }

      const contact: ConstantContactContact = {
        email_address: {
          address: email,
          permission_to_send: 'implicit'
        },
        list_memberships: [LIST_ID]
      }

      if (firstName) contact.first_name = firstName
      if (lastName) contact.last_name = lastName

      const response = await fetch(`${this.API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(contact)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle duplicate email (409 conflict)
        if (response.status === 409) {
          return {
            success: true,
            message: 'Email already subscribed to our list!'
          }
        }

        throw new Error(`Constant Contact API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      const data: ConstantContactResponse = await response.json()
      
      return {
        success: true,
        message: 'Successfully subscribed to our newsletter!',
        contactId: data.contact_id
      }
    } catch (error) {
      console.error('Constant Contact subscription error:', error)
      
      // Fallback to mock subscription for development
      if (import.meta.env.DEV) {
        return this.mockSubscription(email)
      }
      
      return {
        success: false,
        message: 'Failed to subscribe. Please try again later.'
      }
    }
  }

  /**
   * Mock subscription for development/testing
   */
  private static async mockSubscription(email: string): Promise<{ success: boolean; message: string; contactId?: string }> {
    // Simulate API delay
    await new Promise(resolve => {
      try {
        window.setTimeout(resolve, 1000)
      } catch (error) {
        console.error('Error in mock subscription delay:', error)
        resolve(undefined) // Resolve immediately if setTimeout fails
      }
    })
    
    // Store in localStorage for development
    const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
    
    if (subscribers.includes(email)) {
      return {
        success: true,
        message: 'Email already subscribed to our list!'
      }
    }
    
    subscribers.push(email)
    localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers))
    
    return {
      success: true,
      message: 'Successfully subscribed to our newsletter! (Development Mode)',
      contactId: `mock_${Date.now()}`
    }
  }

  /**
   * Get subscription status for an email
   */
  static async getSubscriptionStatus(email: string): Promise<{ subscribed: boolean; contactId?: string }> {
    try {
      const { API_KEY, ACCESS_TOKEN } = this.getEnvVars()
      
      if (!API_KEY || !ACCESS_TOKEN) {
        // Check localStorage in development
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
        return { subscribed: subscribers.includes(email) }
      }

      const response = await fetch(
        `${this.API_BASE_URL}/contacts?email=${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'X-API-Key': API_KEY
          }
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const contact = data.contacts?.[0]
      
      return {
        subscribed: !!contact,
        contactId: contact?.contact_id
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return { subscribed: false }
    }
  }

  /**
   * Unsubscribe an email from the list
   */
  static async unsubscribeEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { API_KEY, ACCESS_TOKEN, LIST_ID } = this.getEnvVars()
      
      if (!API_KEY || !ACCESS_TOKEN) {
        // Remove from localStorage in development
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]')
        const filtered = subscribers.filter((sub: string) => sub !== email)
        localStorage.setItem('newsletter_subscribers', JSON.stringify(filtered))
        
        return {
          success: true,
          message: 'Successfully unsubscribed! (Development Mode)'
        }
      }

      // First, get the contact ID
      const statusResponse = await this.getSubscriptionStatus(email)
      if (!statusResponse.subscribed || !statusResponse.contactId) {
        return {
          success: true,
          message: 'Email not found in our list.'
        }
      }

      // Remove from list
      const response = await fetch(
        `${this.API_BASE_URL}/contacts/${statusResponse.contactId}/list_memberships/${LIST_ID}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'X-API-Key': API_KEY
          }
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from our newsletter.'
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again later.'
      }
    }
  }
}