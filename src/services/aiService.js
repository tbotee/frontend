class AiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  async getAssistantType(prompt) {
    try {
      const routeResult = await fetch('/api/ai/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!routeResult.ok) {
        throw new Error(`Failed to get assistant type: ${routeResult.status}`);
      }

      const routeAssistant = await routeResult.json();
      
      if (!routeAssistant.assistant) {
        throw new Error('Invalid assistant type response');
      }

      return {
        success: true,
        data: routeAssistant.assistant,
        error: null
      };
    } catch (error) {
      console.error('AiService.getAssistantType error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to get assistant type'
      };
    }
  }

  async generateEmail(assistantType, prompt) {
    try {
      const emailResult = await fetch(`/api/ai/generate?assistant=${assistantType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!emailResult.ok) {
        throw new Error(`Failed to generate email: ${emailResult.status}`);
      }

      const email = await emailResult.json();
      
      if (!email.subject || !email.body) {
        throw new Error('Invalid email generation response');
      }

      return {
        success: true,
        data: {
          subject: email.subject || '',
          body: email.body || ''
        },
        error: null
      };
    } catch (error) {
      console.error('AiService.generateEmail error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to generate email'
      };
    }
  }


  async handleAiGenerate(prompt) {
    try {

      const assistantResult = await this.getAssistantType(prompt);
      
      if (!assistantResult.success) {
        return {
          success: false,
          data: null,
          error: assistantResult.error
        };
      }

      const assistantType = assistantResult.data;


      if (assistantType !== 'sales' && assistantType !== 'followup') {
        return {
          success: false,
          data: null,
          error: 'Invalid assistant type'
        };
      }


      const emailResult = await this.generateEmail(assistantType, prompt);
      
      if (!emailResult.success) {
        return {
          success: false,
          data: null,
          error: emailResult.error
        };
      }

      return {
        success: true,
        data: {
          assistantType,
          subject: emailResult.data.subject,
          body: emailResult.data.body
        },
        error: null
      };
    } catch (error) {
      console.error('AiService.handleAiGenerate error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to generate email with AI'
      };
    }
  }
}


const aiService = new AiService();

export default aiService;
