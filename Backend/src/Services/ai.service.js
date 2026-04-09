import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { searchInternet } from "./internet.service.js";

// 1. Initialize Mistral Model
const mistralModel = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0
});

// 2. Initialize Gemini Model
const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
});

// 3. Define the Search Tool
const searchInternetTool = tool(
    async ({ query }) => {
        try {
            console.log("--- 🌍 SEARCHING INTERNET FOR:", query);
            const result = await searchInternet({ query });
            return result;
        } catch (error) {
            return "Search failed.";
        }
    },
    {
        name: "searchInternet",
        description: "Mandatory for questions about news or current events.",
        schema: z.object({
            query: z.string().describe("The search query.")
        })
    }
);

// 4. Create the Agent
const agent = createReactAgent({
    llm: mistralModel,
    tools: [searchInternetTool],
});

function parseContentToString(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .map(item => (typeof item === "string" ? item : (item.text || "")))
            .join("");
    }
    return JSON.stringify(content);
}

export async function generateResponse(messages, imageFile = null) {
    try {
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });

        // ✅ FIX: find last user message correctly
        const lastUserIndex = messages.map(m => m.role).lastIndexOf("user");

        const formattedMessages = messages.map((msg, index) => {

            const isLastUserMessage = index === lastUserIndex;

            if (msg.role === "user") {

                // ✅ FIXED IMAGE ATTACHMENT LOGIC
                if (isLastUserMessage && imageFile) {
                    const base64Image = imageFile.buffer.toString("base64");
                    const imageUrl = `data:${imageFile.mimetype};base64,${base64Image}`;

                    return new HumanMessage({
                        content: [
                            { type: "text", text: msg.content || "Analyze this image." },
                            {
                                type: "image_url",
                                image_url: { url: imageUrl }
                            }
                        ]
                    });
                }

                return new HumanMessage(msg.content);
            }

            if (msg.role === "ai" || msg.role === "assistant") {
                return new AIMessage(msg.content);
            }

            return new HumanMessage(msg.content);
        });

        const systemMessage = new SystemMessage(`
            Today's date is ${currentDate}. 
            Your knowledge cutoff is mid-2024. 
            Use "searchInternet" for any news or events from 2024 or 2025.
            If the user provides an image, analyze it carefully.
        `);

        const result = await agent.invoke({
            messages: [systemMessage, ...formattedMessages]
        });

        const lastMessage = result.messages[result.messages.length - 1];
        return parseContentToString(lastMessage.content);

    } catch (error) {
        console.error("Agent Error:", error);

        try {
            console.log("Using Gemini Fallback...");

            const fallbackMessages = messages.map((msg, index) => {
                const isLast = index === messages.length - 1;

                if (msg.role === "user" && isLast && imageFile) {
                    const base64 = imageFile.buffer.toString("base64");

                    return new HumanMessage({
                        content: [
                            { type: "text", text: msg.content },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${imageFile.mimetype};base64,${base64}`
                                }
                            }
                        ]
                    });
                }

                return new HumanMessage(msg.content);
            });

            const fallback = await geminiModel.invoke(fallbackMessages);
            return parseContentToString(fallback.content);

        } catch (err) {
            console.error("Fallback Error:", err);
            return "⚠️ I'm having trouble analyzing that image or accessing the internet right now.";
        }
    }
}

export async function generateChatTitle(message) {
    try {
        const response = await mistralModel.invoke([
            new SystemMessage("Generate a 2-4 word title."),
            new HumanMessage(message)
        ]);
        return parseContentToString(response.content);
    } catch (error) {
        return "New Chat";
    }
}