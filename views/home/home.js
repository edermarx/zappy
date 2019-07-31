const gel = element => document.querySelector(element);

gel('#add-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`/api/user/contact/${gel('input[name=contact]').value}`);
    console.log(response);
  } catch (err) {
    console.log(err.response.data);
  }
});

gel('#send-message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await axios.post(`/api/message/${window.localStorage.getItem('chatID')}`, {
    content: gel('input[name=message]').value,
  });
});

const getHour = (hour) => {
  const adjustHour = (num) => {
    if (num < 10) return `0${num}`;
    return num;
  };

  const date = new Date(hour);
  return `${adjustHour(date.getHours())}:${adjustHour(date.getMinutes())}`;
};

const renderMessages = async (contactID) => {
  const users = [contactID, window.localStorage.getItem('userID')];
  users.sort();
  const chatIdRaw = users.join('(*-*)');
  const chatID = btoa(chatIdRaw);

  window.localStorage.setItem('chatID', chatID);

  const messages = await axios.get(`/api/message/${chatID}`);

  gel('#messages').innerHTML = '';
  messages.data.forEach((message) => {
    gel('#messages').innerHTML += `
      <p>${message.content} - ${getHour(message.timestamp)}</p>
    `;
  });
}


setInterval(async () => {
  const response = await axios.get('/api/user/contact?tamanho=1');
  if (+response.data !== gel('#contacts').children.length) {
    console.log(+response.data, gel('#contacts').children.length);
    const contacts = await axios.get('/api/user/contact');
    gel('#contacts').innerHTML = '';
    contacts.data.forEach((contact) => {
      gel('#contacts').innerHTML += `
        <p onclick="renderMessages('${contact.id}')">${contact.alias}</p>
      `;
    });
  }
}, 1000);