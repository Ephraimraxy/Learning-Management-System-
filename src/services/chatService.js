import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../config/firebase';

const functions = getFunctions(app);

/**
 * Sends a message to the ISAC AI service.
 * 
 * @param {string} message - The user's message.
 * @param {Array} history - The chat history (optional).
 * @returns {Promise<{text: string, action: object|null}>}
 */
export const sendMessageToISAC = async (message, history = []) => {
    try {
        // TODO: Uncomment when Cloud Function is deployed
        // const chatFn = httpsCallable(functions, 'chatWithISAC');
        // const result = await chatFn({ message, history });
        // return result.data;

        // Fallback to mock response for development/demo
        return await mockAIResponse(message);
    } catch (error) {
        console.error('Error talking to ISAC:', error);
        // Return a graceful error message instead of throwing
        return {
            text: "I'm having trouble connecting to my brain right now. Please try again later.",
            action: null
        };
    }
};

/**
 * Mock AI response generator with agricultural curriculum knowledge.
 * 
 * @param {string} message 
 * @returns {Promise<{text: string, action: object|null}>}
 */
const mockAIResponse = async (message) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerMsg = message.toLowerCase();
            let response = "I'm not sure about that yet. My brain is still growing!";
            let action = null;

            // Identity
            if (lowerMsg.includes('who are you') || lowerMsg.includes('your name') || lowerMsg.includes('what is your name')) {
                response = "I am ISAC, your Intelligent Study Assistant for this Agricultural LMS. I'm here to help you navigate your courses, understand modules, and succeed in your agricultural studies.";
            }
            // Capabilities
            else if (lowerMsg.includes('what can you do') || lowerMsg.includes('help me')) {
                response = "I can help you browse our agricultural curriculum, find specific modules like 'Crop Production' or 'Livestock', guide you to your quizzes, and eventually I'll be able to grade your assignments and answer technical questions about farming practices!";
            }
            // Curriculum - General
            else if (lowerMsg.includes('curriculum') || lowerMsg.includes('structure') || lowerMsg.includes('categories')) {
                response = "Our curriculum is structured into 5 main categories: \n1. 🌱 Crop Production & Value Chains\n2. 🐟🐓 Livestock & Aquaculture\n3. 💻📊 Agribusiness & Finance\n4. 🚜 Farm Technology & Practical Skills\n5. 🧑‍💼 Leadership & Personal Development.\n\nEach category contains specific modules and courses.";
            }
            // Category: Crop Production
            else if (lowerMsg.includes('crop') || lowerMsg.includes('rice') || lowerMsg.includes('maize') || lowerMsg.includes('soybean')) {
                response = "Under 'Crop Production & Value Chains', we have modules like 'Field Crop Production' (covering Rice, Maize, Soybeans) and 'Agricultural Value Chain & Export'. Would you like to go to the Courses page to see them?";
                action = { type: 'navigate', payload: '/courses' };
            }
            // Category: Livestock
            else if (lowerMsg.includes('livestock') || lowerMsg.includes('fish') || lowerMsg.includes('catfish') || lowerMsg.includes('poultry') || lowerMsg.includes('cattle')) {
                response = "Our 'Livestock & Aquaculture' category covers Catfish Farming, Poultry Systems, and Ruminant Fattening (Cattle, Sheep, Goats). It's designed to build technical foundations for production systems.";
                action = { type: 'navigate', payload: '/courses' };
            }
            // Category: Agribusiness
            else if (lowerMsg.includes('business') || lowerMsg.includes('finance') || lowerMsg.includes('entrepreneur')) {
                response = "The 'Agribusiness & Finance' category focuses on Entrepreneurship, Digital Agribusiness, and Financing. It's perfect for learning how to scale your venture.";
            }
            // Category: Technology
            else if (lowerMsg.includes('tech') || lowerMsg.includes('irrigation') || lowerMsg.includes('machine')) {
                response = "In 'Farm Technology & Practical Skills', we offer courses on Farm Irrigation, Machinery, and immersive Onsite Practical Sessions.";
            }
            // Navigation
            else if (lowerMsg.includes('course') || lowerMsg.includes('learn')) {
                response = "You can browse the full agricultural curriculum in the 'Courses' tab. Would you like me to take you there?";
                action = { type: 'navigate', payload: '/courses' };
            } else if (lowerMsg.includes('quiz') || lowerMsg.includes('test')) {
                response = "Quizzes are a great way to test your knowledge on topics like Hydroponics or Value Chains. Check the 'Quizzes' section.";
                action = { type: 'navigate', payload: '/quizzes' };
            } else if (lowerMsg.includes('grade') || lowerMsg.includes('score')) {
                response = "You can view your grades in your Profile or the Dashboard.";
                action = { type: 'navigate', payload: '/student/dashboard' };
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                response = "Hello! I'm ISAC. Ready to explore our agricultural courses today?";
            }

            resolve({
                text: response,
                action: action
            });
        }, 800); // Slightly faster response for better UX
    });
};
