const BOT_TOKEN = '8321865078:AAFTTMugB8A5XEstvTggzY4unzCVvMxzQU0';

async function main() {
  // First get updates to find chat_id
  const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
  const updates = await updatesRes.json();
  console.log('Updates:', JSON.stringify(updates, null, 2));

  if (updates.ok && updates.result.length > 0) {
    const chatId = updates.result[updates.result.length - 1].message.chat.id;
    console.log('Found chat_id:', chatId);

    // Send message
    const message = `🌙 Привет! Это сообщение от Claude Code!

✨ Текущий URL туннеля: https://little-cougars-cry.loca.lt

Все изменения сохранены:
- Убран заголовок из модального окна выбора темы
- Добавлены падающие элементы в Карту Дня
- Ведьминская тема: 🥀🕯️🦇🌑🔮
- Фейская тема: 🌸🦋🌺💗🌷`;

    const sendRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
    const sendResult = await sendRes.json();
    console.log('Send result:', JSON.stringify(sendResult, null, 2));
  } else {
    console.log('No messages found. Please send /start to the bot first.');
  }
}

main().catch(console.error);
