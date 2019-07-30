const gel = element => document.querySelector(element);

gel('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/user/login', {
      username: gel('input[name=username]').value,
      password: gel('input[name=password]').value,
    });

    if(response.data === 'ok'){
      window.location.replace('/');
    }
  } catch (err) {
    console.log(err.response.data);
  }
});