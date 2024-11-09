// ai.mjs

import fetch from 'node-fetch';

const API_KEY = process.env.XAI_API_KEY;
const API_URL = 'https://api.x.ai/v1/chat/completions';

export async function batchData(query) {
    try {
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
                        content: "You are a helpful assistant for Mars-Earth communication."
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                stream: false,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'An error occurred');

        return {
            data: data.choices[0].message.content,
            usage: data.usage
        };
    } catch (error) {
        console.error('Error in batchData:', error);
        return { data: 'Error processing request', usage: { error: error.message } };
    }
}
