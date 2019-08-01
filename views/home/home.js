const gel = element => document.querySelector(element);

const getHour = (hour) => {
  const adjustHour = (num) => {
    if (num < 10) return `0${num}`;
    return num;
  };

  const date = new Date(hour);
  return `${adjustHour(date.getHours())}:${adjustHour(date.getMinutes())}`;
};

const renderMessages = async (contactID, chatID) => {
  console.log('contactID, chatID');
  try {
    let myChatID = chatID;

    if (!chatID) {
      const users = [contactID, window.localStorage.getItem('userID')];
      users.sort();
      const chatIdRaw = users.join('(*-*)');
      myChatID = btoa(chatIdRaw);
    }

    window.localStorage.setItem('chatID', myChatID);

    const response = await axios.get(`/api/message/${myChatID}`);

    gel('#messages').innerHTML = '';

    response.data.forEach((message) => {
      gel('#messages').innerHTML += `
      <p>${message.content} - ${getHour(message.timestamp)}</p>
    `;
    });
  } catch (err) {
    console.log(err.response);
  }
};

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
  try {
    e.preventDefault();
    const chatID = window.localStorage.getItem('chatID');
    const response = await axios.post(`/api/message/${chatID}`, {
      content: gel('input[name=message]').value,
    });
    if (response.data === 'ok') renderMessages(null, chatID);
  } catch (err) {
    console.log(err.response);
  }
});

setInterval(async () => {
  try {
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
  } catch (err) {
    if (err.response.data === 'unauthenticated') {
      window.location.replace('/login');
    }
  }
}, 1000);

setInterval(async () => {
  try {
    const chatID = window.localStorage.getItem('chatID');
    const newMessages = (await axios.get('/api/user/has-message')).data;
    if (newMessages.map(chatIdObject => chatIdObject.chatID).indexOf(chatID) !== -1) {
      console.log('delete');
      await axios.delete(`/api/user/has-message/${chatID}`, { chatID: 3 });
      renderMessages(null, chatID);
    }
  } catch (err) {
    console.log(err.response.data);
  }
}, 1500);
