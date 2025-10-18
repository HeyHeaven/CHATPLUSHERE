export interface ChatMessage {
  timestamp: Date;
  user: string;
  message: string;
}

export interface ParsedChatData {
  messages: ChatMessage[];
  users: Set<string>;
  dateRange: { start: Date; end: Date };
}

export const parseWhatsAppChat = async (file: File): Promise<ParsedChatData> => {
  const text = await file.text();
  const lines = text.split('\n');
  
  const messages: ChatMessage[] = [];
  const users = new Set<string>();
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // WhatsApp format: [DD/MM/YYYY, HH:MM:SS] Username: Message
  // or: DD/MM/YYYY, HH:MM - Username: Message
  const messageRegex = /^[\[]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s*-?\s*([^:]+?):\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(messageRegex);
    if (match) {
      try {
        const [, dateStr, timeStr, username, message] = match;
        
        // Parse date (handle various formats)
        const dateParts = dateStr.split(/[\/\-\.]/);
        let day: number, month: number, year: number;
        
        // Assume DD/MM/YYYY format (common in WhatsApp exports)
        if (dateParts.length === 3) {
          day = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
          year = parseInt(dateParts[2]);
          
          // Handle 2-digit years
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
        } else {
          continue;
        }

        // Parse time
        const timeParts = timeStr.replace(/[AP]M/i, '').trim().split(':');
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        const second = timeParts[2] ? parseInt(timeParts[2]) : 0;

        // Check for AM/PM
        let adjustedHour = hour;
        if (/PM/i.test(timeStr) && hour < 12) {
          adjustedHour += 12;
        } else if (/AM/i.test(timeStr) && hour === 12) {
          adjustedHour = 0;
        }

        const timestamp = new Date(year, month, day, adjustedHour, minute, second);
        
        if (!isNaN(timestamp.getTime())) {
          const cleanUsername = username.trim();
          users.add(cleanUsername);
          
          messages.push({
            timestamp,
            user: cleanUsername,
            message: message.trim(),
          });

          if (!minDate || timestamp < minDate) minDate = timestamp;
          if (!maxDate || timestamp > maxDate) maxDate = timestamp;
        }
      } catch (error) {
        console.warn(`Failed to parse line ${i + 1}:`, line);
      }
    }
  }

  if (messages.length === 0) {
    throw new Error('No valid messages found in the chat file. Please ensure it\'s a WhatsApp chat export.');
  }

  return {
    messages,
    users,
    dateRange: {
      start: minDate || new Date(),
      end: maxDate || new Date(),
    },
  };
};

// Load stop words from file
let stopWords = new Set<string>();
const loadStopWords = async () => {
  try {
    const response = await fetch('/src/assets/stop_hinglish.txt');
    const text = await response.text();
    stopWords = new Set(text.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0));
  } catch (error) {
    console.warn('Failed to load stop words, using default set');
    stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were']);
  }
};

export const analyzeChat = async (parsedData: ParsedChatData[]) => {
  // Load stop words if not already loaded
  if (stopWords.size === 0) {
    await loadStopWords();
  }

  const allMessages = parsedData.flatMap(d => d.messages);
  const allUsers = new Set(parsedData.flatMap(d => Array.from(d.users)));
  
  // Basic statistics
  const totalMessages = allMessages.length;
  const totalUsers = allUsers.size;
  
  // User activity
  const userMessageCounts = new Map<string, number>();
  allMessages.forEach(msg => {
    userMessageCounts.set(msg.user, (userMessageCounts.get(msg.user) || 0) + 1);
  });
  
  const sortedUsers = Array.from(userMessageCounts.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // Word frequency
  const wordCounts = new Map<string, number>();
  
  allMessages.forEach(msg => {
    const words = msg.message.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
      }
    });
  });
  
  const topWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  // Emoji analysis
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const emojiCounts = new Map<string, number>();
  
  allMessages.forEach(msg => {
    const emojis = msg.message.match(emojiRegex);
    if (emojis) {
      emojis.forEach(emoji => {
        emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
      });
    }
  });
  
  const topEmojis = Array.from(emojiCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Time analysis
  const hourCounts = new Array(24).fill(0);
  const dayOfWeekCounts = new Array(7).fill(0);
  const monthCounts = new Array(12).fill(0);
  
  allMessages.forEach(msg => {
    hourCounts[msg.timestamp.getHours()]++;
    dayOfWeekCounts[msg.timestamp.getDay()]++;
    monthCounts[msg.timestamp.getMonth()]++;
  });
  
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));
  const mostActiveDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const mostActiveMonth = monthCounts.indexOf(Math.max(...monthCounts));
  
  // Date range
  const allDates = allMessages.map(m => m.timestamp);
  const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  return {
    totalMessages,
    totalUsers,
    topUsers: sortedUsers.slice(0, 10),
    topWords,
    topEmojis,
    timeAnalysis: {
      hourCounts,
      dayOfWeekCounts,
      monthCounts,
      mostActiveHour,
      mostActiveDay,
      mostActiveMonth,
    },
    dateRange: { start: startDate, end: endDate },
    messages: allMessages,
  };
};
