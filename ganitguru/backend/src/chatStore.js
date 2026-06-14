/**
 * In-memory chat store.
 *
 * Structure:
 *   chats: Map<chatId, { id, title, classLevel, createdAt, messages: [] }>
 *   messages: { role: "user"|"model", parts: [{ text }] }
 *
 * UPGRADING TO A DATABASE:
 *   Replace the Map with your DB of choice:
 *   - MongoDB: store each chat as a document in a "chats" collection
 *   - PostgreSQL: two tables — chats(id, title, class_level, created_at)
 *                 and messages(id, chat_id, role, content, created_at)
 *   - Redis: hash per chatId for metadata, list for messages
 *
 *   All methods below map cleanly to DB queries — just swap the Map ops.
 */

const { v4: uuidv4 } = require("uuid");

const chats = new Map();

function createChat(classLevel = 10) {
  const id = uuidv4();
  const chat = {
    id,
    title: "New Chat",
    classLevel,
    createdAt: new Date().toISOString(),
    messages: [],
  };
  chats.set(id, chat);
  return chat;
}

function getChat(id) {
  return chats.get(id) || null;
}

function getAllChats() {
  return Array.from(chats.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(({ id, title, classLevel, createdAt }) => ({
      id,
      title,
      classLevel,
      createdAt,
    }));
}

function addMessage(chatId, role, text) {
  const chat = chats.get(chatId);
  if (!chat) throw new Error(`Chat ${chatId} not found`);
  const message = { role, parts: [{ text }] };
  chat.messages.push(message);

  // Auto-title from first user message (first 50 chars)
  if (role === "user" && chat.messages.filter((m) => m.role === "user").length === 1) {
    chat.title = text.slice(0, 50) + (text.length > 50 ? "…" : "");
  }
  return message;
}

function getHistory(chatId) {
  const chat = chats.get(chatId);
  return chat ? chat.messages : [];
}

function deleteChat(id) {
  return chats.delete(id);
}

module.exports = { createChat, getChat, getAllChats, addMessage, getHistory, deleteChat };
