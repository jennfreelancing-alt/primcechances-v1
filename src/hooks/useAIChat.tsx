import { useState } from 'react';
import { useAuth } from './useAuth';
import { callOpenAI } from '@/services/openaiService';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message_type: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

export const useAIChat = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startNewSession = () => {
    const sessionId = crypto.randomUUID();
    setCurrentSession({
      sessionId,
      messages: []
    });
    return sessionId;
  };

  const sendMessage = async (message: string, contextData?: any) => {
    if (!user || !currentSession) return;

    setLoading(true);
    
    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      message_type: 'user',
      content: message,
      created_at: new Date().toISOString()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    try {
      // Call OpenAI API for chat completion
      const openaiRes = await callOpenAI('chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          ...currentSession.messages.map(m => ({
            role: m.message_type === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          { role: 'user', content: message }
        ],
        user: user.id,
        ...contextData
      });

      const aiContent = openaiRes.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue. Please try again.';

      // (No error object to check here; OpenAI errors are caught in catch block)

      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        message_type: 'assistant',
        content: aiContent,
        created_at: new Date().toISOString()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : null);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback AI response for demo purposes
      const fallbackResponse = generateFallbackResponse(message);
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        message_type: 'assistant',
        content: fallbackResponse,
        created_at: new Date().toISOString()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : null);
      
      toast.error('Using offline mode - full AI features require server connection');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('job') || lowerMessage.includes('opportunity') || lowerMessage.includes('position')) {
      return "I can help you find job opportunities! Here are some strategies:\n\n1. **Use our AI Recommendations** - Check the recommendations tab for personalized matches based on your profile\n2. **Search by Category** - Browse opportunities by field (Jobs, Internships, Scholarships, etc.)\n3. **Optimize Your Profile** - Update your field of study, experience level, and preferences for better matches\n4. **Set Up Alerts** - We'll notify you when new opportunities match your criteria\n\nWould you like me to help you improve your profile or application materials?";
    } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('curriculum vitae')) {
      return "Here are my top resume optimization tips:\n\n**Structure & Format:**\n• Use clear, professional formatting with consistent fonts\n• Include a compelling summary at the top\n• List experience in reverse chronological order\n• Keep it to 1-2 pages maximum\n\n**Content Tips:**\n• Use action verbs and quantifiable achievements\n• Tailor keywords to match job descriptions\n• Include relevant technical skills prominently\n• Add a projects section if applicable\n\n**ATS Optimization:**\n• Use standard section headings (Experience, Education, Skills)\n• Avoid graphics, tables, or complex formatting\n• Include relevant keywords from job postings\n• Use standard fonts (Arial, Calibri, Times New Roman)\n\nWould you like me to help you with a specific section or use our AI Document Generator to create a tailored resume?";
    } else if (lowerMessage.includes('interview') || lowerMessage.includes('interviewing')) {
      return "Interview preparation is crucial for success! Here's my comprehensive guide:\n\n**Before the Interview:**\n• Research the company thoroughly (mission, values, recent news)\n• Review the job description and prepare relevant examples\n• Practice common questions using the STAR method\n• Prepare thoughtful questions about the role and company\n\n**Common Questions to Prepare:**\n• Tell me about yourself\n• Why are you interested in this position?\n• What are your strengths and weaknesses?\n• Describe a challenging project you worked on\n• Where do you see yourself in 5 years?\n\n**During the Interview:**\n• Maintain good eye contact and body language\n• Listen carefully and ask clarifying questions\n• Use specific examples to demonstrate your skills\n• Show enthusiasm and genuine interest\n\n**Follow-up:**\n• Send a thank-you email within 24 hours\n• Reference specific points from the conversation\n• Reiterate your interest in the position\n\nWhat type of interview are you preparing for? I can provide more specific guidance!";
    } else if (lowerMessage.includes('career') || lowerMessage.includes('advice') || lowerMessage.includes('guidance')) {
      return "I'm here to help with your career journey! Here are some key areas I can assist with:\n\n**Career Planning:**\n• Identifying your strengths and interests\n• Exploring different career paths\n• Setting short and long-term goals\n• Creating a career development plan\n\n**Skill Development:**\n• Identifying in-demand skills in your field\n• Finding learning resources and courses\n• Building a portfolio of projects\n• Networking and professional development\n\n**Job Search Strategy:**\n• Optimizing your online presence\n• Building a professional network\n• Leveraging social media for job hunting\n• Working with recruiters effectively\n\n**Career Transitions:**\n• Switching industries or roles\n• Preparing for career changes\n• Building transferable skills\n• Managing career uncertainty\n\nWhat specific aspect of your career would you like to focus on? I can provide personalized advice based on your situation!";
    } else if (lowerMessage.includes('application') || lowerMessage.includes('apply') || lowerMessage.includes('submitting')) {
      return "Application success depends on several key factors. Here's my strategic approach:\n\n**Before Applying:**\n• Research the company and role thoroughly\n• Ensure your profile is complete and up-to-date\n• Prepare tailored materials for each application\n• Check application deadlines and requirements\n\n**Application Materials:**\n• **Resume/CV:** Tailor to the specific role and company\n• **Cover Letter:** Highlight relevant experience and motivation\n• **Portfolio:** Showcase relevant projects and achievements\n• **References:** Prepare professional references in advance\n\n**Application Process:**\n• Follow all instructions carefully\n• Submit before deadlines\n• Use professional email addresses\n• Proofread everything thoroughly\n\n**Follow-up Strategy:**\n• Send thank-you emails after interviews\n• Follow up on applications after 1-2 weeks\n• Keep track of all applications in a spreadsheet\n• Maintain professional relationships\n\n**Common Mistakes to Avoid:**\n• Generic applications not tailored to the role\n• Missing deadlines or incomplete submissions\n• Poor formatting or typos in materials\n• Not following up appropriately\n\nWhat specific opportunity are you applying for? I can help you optimize your application!";
    } else if (lowerMessage.includes('salary') || lowerMessage.includes('compensation') || lowerMessage.includes('pay')) {
      return "Salary negotiation is an important part of the job search process. Here's my advice:\n\n**Research Phase:**\n• Research industry standards for your role and location\n• Use salary comparison tools (Glassdoor, Payscale, LinkedIn)\n• Consider your experience level and skills\n• Factor in benefits and total compensation package\n\n**Negotiation Strategy:**\n• Wait for the employer to mention salary first\n• Provide a salary range based on your research\n• Focus on your value and contributions\n• Be prepared to discuss benefits and perks\n\n**Key Tips:**\n• Don't undervalue yourself - know your worth\n• Consider the total package, not just base salary\n• Be confident but professional in negotiations\n• Have a walk-away number in mind\n\n**Red Flags to Watch For:**\n• Employers who won't discuss salary ranges\n• Pressure to accept immediately\n• Vague or unclear compensation structures\n• Promises of future raises without guarantees\n\nWould you like help researching salary ranges for your specific role or location?";
    } else if (lowerMessage.includes('network') || lowerMessage.includes('networking')) {
      return "Networking is crucial for career success! Here's my comprehensive networking strategy:\n\n**Online Networking:**\n• Optimize your LinkedIn profile with relevant keywords\n• Join industry-specific groups and participate actively\n• Share relevant content and insights\n• Connect with professionals in your field\n\n**In-Person Networking:**\n• Attend industry conferences and meetups\n• Join professional associations\n• Participate in local business events\n• Volunteer for industry organizations\n\n**Networking Best Practices:**\n• Be genuine and offer value to others\n• Follow up with new connections promptly\n• Maintain relationships over time\n• Ask thoughtful questions and listen actively\n\n**Building Your Network:**\n• Start with your existing contacts (friends, family, colleagues)\n• Reach out to alumni from your school\n• Connect with former coworkers and managers\n• Join online communities in your field\n\n**Networking Etiquette:**\n• Always send personalized connection requests\n• Respect people's time and boundaries\n• Offer to help others before asking for favors\n• Keep your network updated on your career progress\n\nWhat type of networking would you like to focus on? I can provide more specific strategies!";
    } else {
      return "I'm your AI Career Assistant, here to help with every aspect of your professional journey! 🚀\n\n**I can help you with:**\n• Finding job opportunities and career paths\n• Optimizing your resume and application materials\n• Preparing for interviews and negotiations\n• Career planning and skill development\n• Networking and professional growth\n• Salary research and compensation strategies\n\n**Quick Actions:**\n• Check out our AI Recommendations for personalized job matches\n• Use our Document Generator to create professional CVs and cover letters\n• Explore different opportunity categories (Jobs, Internships, Scholarships)\n• Update your profile for better AI matching\n\nWhat would you like to work on today? I'm here to provide personalized guidance and support!";
    }
  };

  const loadChatHistory = async (sessionId?: string) => {
    if (!user) return;
    console.log('Loading chat history for session:', sessionId || currentSession?.sessionId);
    // This would typically load from database in a real implementation
  };

  return {
    currentSession,
    loading,
    startNewSession,
    sendMessage,
    loadChatHistory
  };
};
