import { z } from 'zod';

// Validation schemas
const EmailSchema = z.object({
  to: z.string().email('To field must be a valid email address'),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

const EmailListResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(z.object({
      id: z.union([z.string(), z.number()]),         // allow number or string
      to: z.string().email(),
      cc: z.string().nullable().optional(),          // allow null
      bcc: z.string().nullable().optional(),         // allow null
      subject: z.string(),
      body: z.string(),
      created_at: z.union([z.string(), z.number()]), // allow number or string
    })),
  });

const EmailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    to: z.string(),
    cc: z.string().optional(),
    bcc: z.string().optional(),
    subject: z.string(),
    body: z.string(),
    created_at: z.string(),
  }),
});

class EmailService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  // Validate email list
  validateEmailList(emailList) {
    if (!emailList.trim()) return true; // Empty is valid
    const emails = emailList.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => emailRegex.test(email));
  }

  // Validate compose data
  validateComposeData(composeData) {
    try {
      EmailSchema.parse(composeData);
      
      // Additional validation for CC and BCC
      if (composeData.cc && !this.validateEmailList(composeData.cc)) {
        throw new Error('CC must contain valid email addresses separated by commas');
      }
      
      if (composeData.bcc && !this.validateEmailList(composeData.bcc)) {
        throw new Error('BCC must contain valid email addresses separated by commas');
      }
      
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.issues.forEach(issue => {
            errors[issue.path[0]] = issue.message;
        });
        return { isValid: false, errors };
      } else if (error instanceof Error) {
        return { isValid: false, errors: { general: error.message } };
      } else {
        // unexpected case
        return { isValid: false, errors: { general: "Unknown validation error" } };
      }
    }
  }

  // Fetch emails from backend
  async fetchEmails() {
    try {
      const response = await fetch(`${this.baseUrl}/emails`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonResponse = await response.json();
      
      // Validate response structure
      const validatedData = EmailListResponseSchema.parse(jsonResponse);
      
      if (!validatedData.success) {
        throw new Error('Failed to fetch emails from server');
      }
      
      return {
        success: true,
        data: validatedData.data,
        error: null
      };
    } catch (error) {
      console.error('EmailService.fetchEmails error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to load emails'
      };
    }
  }

  // Send email
  async sendEmail(composeData) {
    try {
      // Validate compose data first
      const validation = this.validateComposeData(composeData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          error: 'Validation failed',
          validationErrors: validation.errors
        };
      }

      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }

      const jsonResponse = await response.json();
      
      // Validate response structure
      const validatedData = EmailResponseSchema.parse(jsonResponse);
      
      if (!validatedData.success) {
        throw new Error('Failed to send email');
      }

      return {
        success: true,
        data: validatedData.data,
        error: null
      };
    } catch (error) {
      console.error('EmailService.sendEmail error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to send email'
      };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;