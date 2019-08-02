// ==================== FUNCTIONS ==================== //

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
  try {
    let myChatID = chatID;
    console.log(chatID);

    if (!chatID) {
      const users = [contactID, window.localStorage.getItem('userID')];
      users.sort();
      const chatIdRaw = users.join('(*-*)');
      myChatID = btoa(chatIdRaw);
    }

    window.localStorage.setItem('chatID', myChatID);

    const response = await axios.get(`/api/message/${myChatID}`);

    gel('#messages').innerHTML = '';

    response.data.reverse().forEach((messageObject) => {
      gel('#messages').innerHTML += `
      <p ondblclick="deleteMessage('${messageObject.key}')">${messageObject.data.content} - ${getHour(messageObject.data.timestamp)}</p>
      `;
    });
  } catch (err) {
    console.log(err.response);
  }
};

const showProfile = async () => {
  setTimeout(async () => {
    gel('#profile-image').innerHTML += `
    <img src="/uploads/image-profiles/${window.localStorage.getItem('userID')}.png" width="50px" height="50px">
  `;
    const response = await axios.get('/api/user/profile');
    gel('#alias').innerHTML = `Bem vindo ${response.data.alias}!`;
  }, 1000);
};

const deleteMessage = async (messageID) => {
  await axios.delete(`/api/message/${window.localStorage.getItem('chatID')}/${messageID}`);
  renderMessages(null, window.localStorage.getItem('chatID'));
};

// ==================== EVENTS ==================== //

gel('#add-contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    axios.post(`/api/user/contact/${gel('input[name=contact]').value}`);
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
    gel('input[name=message]').value = '';
  } catch (err) {
    console.log(err.response);
  }
});

gel('#edit-alias-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const response = await axios.patch('/api/user/profile', {
    alias: gel('input[name=alias]').value,
  });
  if (response.data === 'ok') showProfile();
});

gel('[name="profile-image"]').addEventListener('change', async (e) => {
  const data = new FormData();
  data.append('profile-image', e.currentTarget.files[0], `${window.localStorage.getItem('userID')}.png`);
  const response = await axios.post('/api/user/profile/image', data, { 'content-type': 'multipart/form-data' });
  console.log(response.data);
  if (response.data === 'ok') showProfile();
});

// ==================== LISTENERS ==================== //

setInterval(async () => {
  try {
    const response = await axios.get('/api/user/contact?tamanho=1');
    if (+response.data !== gel('#contacts').children.length) {
      const contacts = await axios.get('/api/user/contact');
      gel('#contacts').innerHTML = '';
      contacts.data.forEach((contact) => {
        gel('#contacts').innerHTML += `
        <p onclick="renderMessages('${contact.id}')">${contact.alias}</p>
        <img src="/uploads/image-profiles/${contact.id}.png" width="50px" height="50px">
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
      await axios.delete(`/api/user/has-message/${chatID}`, { chatID: 3 });
      renderMessages(null, chatID);
    }
  } catch (err) {
    console.log(err.response.data);
  }
}, 1500);

// ===================== CALLS ==================== //

showProfile();
