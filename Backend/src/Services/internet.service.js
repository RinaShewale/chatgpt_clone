import { tavily as Tavily } from "@tavily/core";

const tavily = Tavily({
    apiKey: process.env.TAVILY_API_KEY
});

export const searchInternet = async ({ query }) => {
    try {
        const result = await tavily.search(query, {
            maxResults: 5,
            
        });
        return JSON.stringify(result);
    } catch (error) {
        console.error("Tavily Error:", error);
        return "Failed to search the internet.";
    }
};