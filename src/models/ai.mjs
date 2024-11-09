import fetch from 'node-fetch';
import 'dotenv/config';

const API_KEY = process.env.XAI_API_KEY;
const API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Function to query xAI API
 * @param {string} prompt - The query message to send to xAI
 * @param {string} destination - The destination (Mars, Moon, etc.)
 * @returns {object} - Response from xAI API
 */
export async function queryAI(prompt, destination) {
    try {
        console.log(`Sending query to xAI: ${prompt} | Destination: ${destination}`);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assisting with communication between Earth and ${destination}.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                stream: false,
                temperature: 0.5
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Error from xAI:', data);
            return { success: false, message: data.error || 'Error from AI' };
        }

        console.log('Received response from xAI:', data.choices[0].message.content);
        return {
            success: true,
            data: data.choices[0].message.content,
            usage: data.usage
        };
    } catch (error) {
        console.error('Error querying AI:', error);
        return { success: false, message: error.message };
    }
}
