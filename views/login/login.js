const gel = element => document.querySelector(element);

gel('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/user/login', {
      username: gel('input[name=username]').value,
      password: gel('input[name=password]').value,
    });

    if (response.status === 200) {
      window.localStorage.setItem('userID', response.data);
      window.location.replace('/');
    }
  } catch (err) {
    const errorMessages = {
      'wrong-password': 'Senha Incorreta'
    };
    alert(errorMessages[err.response.data]);
  }
});
